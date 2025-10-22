// CH-01: Дедупликация медиа-файлов по sha256+size

export interface DeduplicationResult {
  isDuplicate: boolean;
  existingFile?: {
    id: string;
    storageKey: string;
    name: string;
    size: number;
    mime: string;
    kind: string;
    createdAt: Date;
  };
}

export interface FileHash {
  sha256: string;
  size: number;
  name: string;
  mime: string;
}

export class FileDeduplicationService {
  // Проверка дедупликации по sha256+size
  async checkDeduplication(
    fileHash: FileHash,
    chatId: string,
    uploaderId: string
  ): Promise<DeduplicationResult> {
    try {
      // Ищем существующий файл с таким же sha256 и размером
      const existingFile = await this.findExistingFile(fileHash.sha256, fileHash.size);
      
      if (existingFile) {
        // Проверяем, есть ли у пользователя доступ к существующему файлу
        const hasAccess = await this.checkFileAccess(existingFile.id, chatId, uploaderId);
        
        if (hasAccess) {
          return {
            isDuplicate: true,
            existingFile: {
              id: existingFile.id,
              storageKey: existingFile.storage_key,
              name: existingFile.name,
              size: existingFile.size_bytes,
              mime: existingFile.mime,
              kind: existingFile.kind,
              createdAt: existingFile.created_at
            }
          };
        }
      }
      
      return { isDuplicate: false };
      
    } catch (error) {
      console.error('Deduplication check failed:', error);
      // В случае ошибки продолжаем без дедупликации
      return { isDuplicate: false };
    }
  }
  
  // Поиск существующего файла по sha256 и размеру
  private async findExistingFile(sha256: string, size: number) {
    // TODO: Реализовать запрос к БД
    // SELECT * FROM chat_file 
    // WHERE sha256 = ? AND size_bytes = ? 
    // ORDER BY created_at ASC 
    // LIMIT 1
    
    // Мок-данные для демонстрации
    if (sha256 === 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab' && size === 1024000) {
      return {
        id: 'existing-file-123',
        storage_key: 'chats/chat-456/existing-file-123/original',
        name: 'duplicate.jpg',
        size_bytes: 1024000,
        mime: 'image/jpeg',
        kind: 'image',
        created_at: new Date('2024-01-01T00:00:00Z')
      };
    }
    
    return null;
  }
  
  // Проверка доступа к файлу
  private async checkFileAccess(fileId: string, chatId: string, userId: string): Promise<boolean> {
    // TODO: Реализовать проверку ACL
    // Проверяем, что пользователь является участником чата, где находится файл
    
    // Мок-логика: всегда разрешаем доступ
    return true;
  }
  
  // Создание ссылки на существующий файл (без дублирования в S3)
  async createFileReference(
    existingFileId: string,
    chatId: string,
    messageId: string | null,
    uploaderId: string
  ): Promise<string> {
    try {
      // Создаем новую запись в БД, ссылающуюся на существующий файл
      const newFileId = crypto.randomUUID();
      
      // TODO: Реализовать INSERT в БД
      // INSERT INTO chat_file (id, chat_id, message_id, uploader_id, ...)
      // VALUES (?, ?, ?, ?, ...)
      
      console.log('Creating file reference:', {
        newFileId,
        existingFileId,
        chatId,
        messageId,
        uploaderId
      });
      
      return newFileId;
      
    } catch (error) {
      console.error('Failed to create file reference:', error);
      throw new Error('Failed to create file reference');
    }
  }
  
  // Получение статистики дедупликации
  async getDeduplicationStats(chatId: string, timeRange?: { from: Date; to: Date }) {
    // TODO: Реализовать запрос к БД для статистики
    // SELECT 
    //   COUNT(*) as total_files,
    //   COUNT(DISTINCT sha256) as unique_files,
    //   SUM(size_bytes) as total_size,
    //   SUM(CASE WHEN created_at != first_created_at THEN size_bytes ELSE 0 END) as saved_size
    // FROM chat_file 
    // WHERE chat_id = ? AND created_at BETWEEN ? AND ?
    
    return {
      totalFiles: 0,
      uniqueFiles: 0,
      totalSize: 0,
      savedSize: 0,
      deduplicationRate: 0
    };
  }
  
  // Очистка неиспользуемых файлов (garbage collection)
  async cleanupUnusedFiles(olderThanDays: number = 30): Promise<number> {
    try {
      // TODO: Реализовать поиск и удаление неиспользуемых файлов
      // 1. Найти файлы, на которые нет ссылок в chat_file
      // 2. Проверить, что файл старше указанного периода
      // 3. Удалить файл из S3
      // 4. Удалить запись из БД
      
      console.log(`Cleaning up files older than ${olderThanDays} days`);
      return 0; // Количество удаленных файлов
      
    } catch (error) {
      console.error('Cleanup failed:', error);
      return 0;
    }
  }
}

// Утилиты для работы с хешами файлов
export class FileHashUtils {
  // Вычисление SHA256 хеша файла
  static async calculateSHA256(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Проверка целостности файла
  static async verifyFileIntegrity(file: File, expectedSHA256: string): Promise<boolean> {
    const actualSHA256 = await this.calculateSHA256(file);
    return actualSHA256 === expectedSHA256;
  }
  
  // Генерация уникального имени файла
  static generateUniqueFileName(originalName: string, fileId: string): string {
    const extension = originalName.split('.').pop() || '';
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    return `${nameWithoutExt}_${fileId.slice(0, 8)}.${extension}`;
  }
  
  // Нормализация имени файла
  static normalizeFileName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Заменяем спецсимволы на _
      .replace(/_+/g, '_') // Убираем множественные _
      .replace(/^_|_$/g, '') // Убираем _ в начале и конце
      .toLowerCase();
  }
}

// Создание экземпляра сервиса дедупликации
export function createDeduplicationService(): FileDeduplicationService {
  return new FileDeduplicationService();
}
