import { offlineDB, OutboxMessage, OutboxChunk } from './idb';
import { api } from '@/lib/auth/api';

// Конфигурация ретраев
const RETRY_DELAYS = [3000, 5000, 10000, 30000, 60000, 300000]; // 3s, 5s, 10s, 30s, 1m, 5m
const MAX_RETRIES = RETRY_DELAYS.length;

export class OutboxQueue {
  private isProcessing = false;
  private retryTimeouts = new Map<string, NodeJS.Timeout>();

  constructor() {
    // Слушаем события сети
    window.addEventListener('online', () => {
      console.log('Network online, processing outbox...');
      this.processAll();
    });

    // Периодическая проверка (каждые 30 секунд)
    setInterval(() => {
      if (navigator.onLine) {
        this.processAll();
      }
    }, 30000);
  }

  // Добавление сообщения в очередь
  async enqueueMessage(chatId: string, text: string, clientId?: string): Promise<string> {
    const messageId = await offlineDB.addOutboxMessage({
      chatId,
      kind: 'text',
      payload: { text },
      clientId,
    });

    console.log(`Message queued: ${messageId}`);
    
    // Если онлайн, сразу пытаемся отправить
    if (navigator.onLine) {
      this.processAll();
    }

    return messageId;
  }

  // Добавление файла в очередь
  async enqueueFile(chatId: string, file: File, meta: any, clientId?: string): Promise<string> {
    // Сначала сохраняем файл локально
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await offlineDB.addLocalAttachment({
      tempId,
      previewBlob: file,
      meta: {
        name: file.name,
        mime: file.type,
        size: file.size,
      },
      createdAt: Date.now(),
    });

    const messageId = await offlineDB.addOutboxMessage({
      chatId,
      kind: 'file',
      payload: { 
        tempId,
        name: file.name,
        mime: file.type,
        size: file.size,
        ...meta 
      },
      clientId,
    });

    console.log(`File queued: ${messageId}`);
    
    if (navigator.onLine) {
      this.processAll();
    }

    return messageId;
  }

  // Обработка всей очереди
  async processAll(): Promise<void> {
    if (this.isProcessing || !navigator.onLine) {
      return;
    }

    this.isProcessing = true;
    console.log('Processing outbox queue...');

    try {
      const messages = await offlineDB.getOutboxMessages();
      const pendingMessages = messages.filter(m => m.status === 'pending' || m.status === 'failed');

      for (const message of pendingMessages) {
        await this.processMessage(message);
      }
    } catch (error) {
      console.error('Error processing outbox:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Обработка отдельного сообщения
  private async processMessage(message: OutboxMessage): Promise<void> {
    if (message.status === 'sending') {
      return; // Уже обрабатывается
    }

    // Обновляем статус на "отправляется"
    await offlineDB.updateOutboxMessage(message.id, { status: 'sending' });

    try {
      if (message.kind === 'text') {
        await this.sendTextMessage(message);
      } else if (message.kind === 'file') {
        await this.sendFileMessage(message);
      }

      // Успешно отправлено
      await offlineDB.updateOutboxMessage(message.id, { 
        status: 'sent',
        retryCount: message.retryCount + 1 
      });

      console.log(`Message sent: ${message.id}`);
      
      // Уведомляем UI
      this.notifyUI('outbox:sent', { messageId: message.id });

    } catch (error) {
      console.error(`Failed to send message ${message.id}:`, error);
      await this.handleRetry(message, error);
    }
  }

  // Отправка текстового сообщения
  private async sendTextMessage(message: OutboxMessage): Promise<void> {
    const response = await api.post(`/api/shipments/${message.chatId}/messages`, {
      kind: 'text',
      payload: message.payload,
      clientId: message.clientId,
    });

    if (!response.data) {
      throw new Error('No response data');
    }
  }

  // Отправка файла
  private async sendFileMessage(message: OutboxMessage): Promise<void> {
    const { tempId, name, mime, size } = message.payload;
    
    // Получаем локальный файл
    const localAttachment = await offlineDB.getLocalAttachment(tempId);
    if (!localAttachment) {
      throw new Error('Local attachment not found');
    }

    // Создаем upload session
    const createResponse = await api.post('/api/files/upload/create', {
      chatId: message.chatId,
      fileName: name,
      mime,
      bytes: size,
      sha256: await this.calculateSHA256(localAttachment.previewBlob),
    });

    if (!createResponse.data) {
      throw new Error('Failed to create upload session');
    }

    const { attachmentId, putUrl } = createResponse.data;

    // Загружаем файл
    const uploadResponse = await fetch(putUrl, {
      method: 'PUT',
      body: localAttachment.previewBlob,
      headers: {
        'Content-Type': mime,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('File upload failed');
    }

    // Завершаем загрузку
    const completeResponse = await api.post('/api/files/upload/complete', {
      attachmentId,
      clientId: message.clientId,
    });

    if (!completeResponse.data) {
      throw new Error('Failed to complete upload');
    }

    // Удаляем локальный файл
    await offlineDB.deleteLocalAttachment(tempId);
  }

  // Обработка ретрая
  private async handleRetry(message: OutboxMessage, error: any): Promise<void> {
    const newRetryCount = message.retryCount + 1;
    
    if (newRetryCount >= MAX_RETRIES) {
      // Максимальное количество попыток достигнуто
      await offlineDB.updateOutboxMessage(message.id, { 
        status: 'failed',
        retryCount: newRetryCount 
      });
      
      console.error(`Message ${message.id} failed permanently after ${MAX_RETRIES} retries`);
      this.notifyUI('outbox:failed', { messageId: message.id, error: error.message });
      return;
    }

    // Планируем следующую попытку
    const delay = RETRY_DELAYS[newRetryCount - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
    
    await offlineDB.updateOutboxMessage(message.id, { 
      status: 'pending',
      retryCount: newRetryCount,
      lastRetryAt: Date.now()
    });

    // Устанавливаем таймаут для следующей попытки
    const timeoutId = setTimeout(() => {
      this.retryTimeouts.delete(message.id);
      if (navigator.onLine) {
        this.processMessage(message);
      }
    }, delay);

    this.retryTimeouts.set(message.id, timeoutId);
    
    console.log(`Message ${message.id} scheduled for retry ${newRetryCount}/${MAX_RETRIES} in ${delay}ms`);
  }

  // Вычисление SHA256
  private async calculateSHA256(blob: Blob): Promise<string> {
    const buffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Уведомление UI
  private notifyUI(event: string, data: any): void {
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  // Получение статистики очереди
  async getQueueStats(): Promise<{
    pending: number;
    sending: number;
    failed: number;
    total: number;
  }> {
    const messages = await offlineDB.getOutboxMessages();
    
    return {
      pending: messages.filter(m => m.status === 'pending').length,
      sending: messages.filter(m => m.status === 'sending').length,
      failed: messages.filter(m => m.status === 'failed').length,
      total: messages.length,
    };
  }

  // Очистка очереди
  async clearQueue(): Promise<void> {
    // Отменяем все таймауты
    for (const timeoutId of this.retryTimeouts.values()) {
      clearTimeout(timeoutId);
    }
    this.retryTimeouts.clear();

    // Очищаем базу данных
    await offlineDB.clearAll();
    console.log('Outbox queue cleared');
  }

  // Принудительная отправка
  async forceProcess(): Promise<void> {
    console.log('Force processing outbox...');
    await this.processAll();
  }
}

// Синглтон экземпляр
export const outboxQueue = new OutboxQueue();


