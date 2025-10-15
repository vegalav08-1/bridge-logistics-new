import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Схема базы данных для офлайн режима
export interface OfflineDB extends DBSchema {
  outboxMessages: {
    key: string;
    value: OutboxMessage;
    indexes: { 'by-chatId': string; 'by-createdAt': number };
  };
  outboxChunks: {
    key: string;
    value: OutboxChunk;
    indexes: { 'by-uploadId': string; 'by-partNo': number };
  };
  attachmentsLocal: {
    key: string;
    value: LocalAttachment;
    indexes: { 'by-tempId': string };
  };
  cacheChats: {
    key: string;
    value: CachedChat;
    indexes: { 'by-chatId': string; 'by-updatedAt': number };
  };
}

// Типы данных
export interface OutboxMessage {
  id: string;
  chatId: string;
  kind: 'text' | 'file' | 'system';
  payload: any;
  createdAt: number;
  retryCount: number;
  lastRetryAt?: number;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  clientId?: string;
}

export interface OutboxChunk {
  id: string;
  uploadId: string;
  partNo: number;
  blob: Blob;
  checksum: string;
  size: number;
  createdAt: number;
  status: 'pending' | 'uploading' | 'uploaded' | 'failed';
}

export interface LocalAttachment {
  tempId: string;
  previewBlob: Blob;
  meta: {
    name: string;
    mime: string;
    size: number;
    width?: number;
    height?: number;
  };
  createdAt: number;
}

export interface CachedChat {
  chatId: string;
  messages: any[];
  updatedAt: number;
  lastReadSeq: number;
}

// Класс для работы с IndexedDB
export class OfflineDBService {
  private db: IDBPDatabase<OfflineDB> | null = null;
  private dbName = 'bridge-offline';
  private version = 1;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<OfflineDB>(this.dbName, this.version, {
      upgrade(db) {
        // Outbox messages
        if (!db.objectStoreNames.contains('outboxMessages')) {
          const outboxStore = db.createObjectStore('outboxMessages', { keyPath: 'id' });
          outboxStore.createIndex('by-chatId', 'chatId');
          outboxStore.createIndex('by-createdAt', 'createdAt');
        }

        // Outbox chunks
        if (!db.objectStoreNames.contains('outboxChunks')) {
          const chunksStore = db.createObjectStore('outboxChunks', { keyPath: 'id' });
          chunksStore.createIndex('by-uploadId', 'uploadId');
          chunksStore.createIndex('by-partNo', 'partNo');
        }

        // Local attachments
        if (!db.objectStoreNames.contains('attachmentsLocal')) {
          const attachmentsStore = db.createObjectStore('attachmentsLocal', { keyPath: 'tempId' });
          attachmentsStore.createIndex('by-tempId', 'tempId');
        }

        // Cached chats
        if (!db.objectStoreNames.contains('cacheChats')) {
          const chatsStore = db.createObjectStore('cacheChats', { keyPath: 'chatId' });
          chatsStore.createIndex('by-chatId', 'chatId');
          chatsStore.createIndex('by-updatedAt', 'updatedAt');
        }
      },
    });
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // Outbox Messages
  async addOutboxMessage(message: Omit<OutboxMessage, 'id' | 'createdAt' | 'retryCount' | 'status'>): Promise<string> {
    await this.init();
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const outboxMessage: OutboxMessage = {
      id,
      ...message,
      createdAt: Date.now(),
      retryCount: 0,
      status: 'pending',
    };
    
    await this.db!.add('outboxMessages', outboxMessage);
    return id;
  }

  async getOutboxMessages(chatId?: string): Promise<OutboxMessage[]> {
    await this.init();
    if (chatId) {
      return await this.db!.getAllFromIndex('outboxMessages', 'by-chatId', chatId);
    }
    return await this.db!.getAll('outboxMessages');
  }

  async updateOutboxMessage(id: string, updates: Partial<OutboxMessage>): Promise<void> {
    await this.init();
    await this.db!.put('outboxMessages', { ...updates, id } as OutboxMessage);
  }

  async deleteOutboxMessage(id: string): Promise<void> {
    await this.init();
    await this.db!.delete('outboxMessages', id);
  }

  // Outbox Chunks
  async addOutboxChunk(chunk: Omit<OutboxChunk, 'id' | 'createdAt' | 'status'>): Promise<string> {
    await this.init();
    const id = `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const outboxChunk: OutboxChunk = {
      id,
      ...chunk,
      createdAt: Date.now(),
      status: 'pending',
    };
    
    await this.db!.add('outboxChunks', outboxChunk);
    return id;
  }

  async getOutboxChunks(uploadId: string): Promise<OutboxChunk[]> {
    await this.init();
    return await this.db!.getAllFromIndex('outboxChunks', 'by-uploadId', uploadId);
  }

  async updateOutboxChunk(id: string, updates: Partial<OutboxChunk>): Promise<void> {
    await this.init();
    await this.db!.put('outboxChunks', { ...updates, id } as OutboxChunk);
  }

  async deleteOutboxChunk(id: string): Promise<void> {
    await this.init();
    await this.db!.delete('outboxChunks', id);
  }

  // Local Attachments
  async addLocalAttachment(attachment: Omit<LocalAttachment, 'createdAt'>): Promise<void> {
    await this.init();
    const localAttachment: LocalAttachment = {
      ...attachment,
      createdAt: Date.now(),
    };
    
    await this.db!.add('attachmentsLocal', localAttachment);
  }

  async getLocalAttachment(tempId: string): Promise<LocalAttachment | undefined> {
    await this.init();
    return await this.db!.get('attachmentsLocal', tempId);
  }

  async deleteLocalAttachment(tempId: string): Promise<void> {
    await this.init();
    await this.db!.delete('attachmentsLocal', tempId);
  }

  // Cached Chats
  async cacheChat(chat: CachedChat): Promise<void> {
    await this.init();
    await this.db!.put('cacheChats', chat);
  }

  async getCachedChat(chatId: string): Promise<CachedChat | undefined> {
    await this.init();
    return await this.db!.get('cacheChats', chatId);
  }

  async getCachedChats(): Promise<CachedChat[]> {
    await this.init();
    return await this.db!.getAll('cacheChats');
  }

  // Очистка данных
  async clearAll(): Promise<void> {
    await this.init();
    await this.db!.clear('outboxMessages');
    await this.db!.clear('outboxChunks');
    await this.db!.clear('attachmentsLocal');
    await this.db!.clear('cacheChats');
  }

  // Статистика
  async getStats(): Promise<{
    outboxMessages: number;
    outboxChunks: number;
    localAttachments: number;
    cachedChats: number;
  }> {
    await this.init();
    const [outboxMessages, outboxChunks, localAttachments, cachedChats] = await Promise.all([
      this.db!.count('outboxMessages'),
      this.db!.count('outboxChunks'),
      this.db!.count('attachmentsLocal'),
      this.db!.count('cacheChats'),
    ]);

    return {
      outboxMessages,
      outboxChunks,
      localAttachments,
      cachedChats,
    };
  }
}

// Синглтон экземпляр
export const offlineDB = new OfflineDBService();
