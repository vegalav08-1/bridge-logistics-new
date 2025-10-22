// CH-01: S3-совместимое хранилище для медиа-файлов

export interface S3Config {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface UploadPart {
  partNumber: number;
  etag: string;
}

export interface PresignedUploadOptions {
  expiresIn?: number;
  contentType?: string;
  maxFileSize?: number;
}

export interface SignedUrlOptions {
  expiresIn?: number;
  variant?: 'original' | 'thumb' | 'poster' | 'hls';
  width?: number;
  height?: number;
}

export class ChatMediaStorage {
  private config: S3Config;
  
  constructor(config: S3Config) {
    this.config = config;
  }
  
  // Инициализация multipart загрузки
  async initMultipartUpload(
    key: string, 
    contentType: string,
    options: PresignedUploadOptions = {}
  ): Promise<{
    uploadId: string;
    presignedUrls: string[];
    partSize: number;
  }> {
    const { expiresIn = 3600, maxFileSize = 200 * 1024 * 1024 } = options;
    const partSize = Math.min(10 * 1024 * 1024, maxFileSize); // 10MB чанки
    const numParts = Math.ceil(maxFileSize / partSize);
    
    // TODO: Реализовать S3 createMultipartUpload
    const uploadId = crypto.randomUUID();
    
    // Генерируем presigned URLs для каждой части
    const presignedUrls = await Promise.all(
      Array.from({ length: numParts }, (_, i) => 
        this.generatePresignedUrl(key, 'PUT', {
          expiresIn,
          contentType,
          partNumber: i + 1,
          uploadId
        })
      )
    );
    
    return {
      uploadId,
      presignedUrls,
      partSize
    };
  }
  
  // Завершение multipart загрузки
  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: UploadPart[]
  ): Promise<void> {
    // TODO: Реализовать S3 completeMultipartUpload
    console.log('Completing multipart upload:', { key, uploadId, parts });
  }
  
  // Отмена multipart загрузки
  async abortMultipartUpload(key: string, uploadId: string): Promise<void> {
    // TODO: Реализовать S3 abortMultipartUpload
    console.log('Aborting multipart upload:', { key, uploadId });
  }
  
  // Генерация подписанного URL для загрузки
  async generatePresignedUploadUrl(
    key: string,
    contentType: string,
    options: PresignedUploadOptions = {}
  ): Promise<string> {
    return this.generatePresignedUrl(key, 'PUT', {
      expiresIn: options.expiresIn || 3600,
      contentType
    });
  }
  
  // Генерация подписанного URL для доступа к файлу
  async generateSignedUrl(
    key: string,
    options: SignedUrlOptions = {}
  ): Promise<string> {
    const { expiresIn = 3600, variant = 'original', width, height } = options;
    
    // Определяем ключ для варианта файла
    let finalKey = key;
    if (variant === 'thumb' && width && height) {
      finalKey = key.replace('/original', `/thumb_${width}x${height}.webp`);
    } else if (variant === 'poster') {
      finalKey = key.replace('/original', '/poster.jpg');
    } else if (variant === 'hls') {
      finalKey = key.replace('/original', '/hls/playlist.m3u8');
    }
    
    return this.generatePresignedUrl(finalKey, 'GET', {
      expiresIn,
      variant,
      width,
      height
    });
  }
  
  // Удаление файла
  async deleteFile(key: string): Promise<void> {
    // TODO: Реализовать S3 deleteObject
    console.log('Deleting file:', key);
  }
  
  // Копирование файла
  async copyFile(sourceKey: string, destKey: string): Promise<void> {
    // TODO: Реализовать S3 copyObject
    console.log('Copying file:', { sourceKey, destKey });
  }
  
  // Проверка существования файла
  async fileExists(key: string): Promise<boolean> {
    // TODO: Реализовать S3 headObject
    return true;
  }
  
  // Получение метаданных файла
  async getFileMetadata(key: string): Promise<{
    size: number;
    lastModified: Date;
    etag: string;
    contentType: string;
  } | null> {
    // TODO: Реализовать S3 headObject
    return {
      size: 1024000,
      lastModified: new Date(),
      etag: '"abc123"',
      contentType: 'image/jpeg'
    };
  }
  
  // Генерация presigned URL
  private async generatePresignedUrl(
    key: string,
    method: 'GET' | 'PUT' | 'POST',
    options: {
      expiresIn?: number;
      contentType?: string;
      partNumber?: number;
      uploadId?: string;
      variant?: string;
      width?: number;
      height?: number;
    } = {}
  ): Promise<string> {
    const {
      expiresIn = 3600,
      contentType,
      partNumber,
      uploadId,
      variant,
      width,
      height
    } = options;
    
    // TODO: Реализовать AWS SDK S3 getSignedUrl
    const params = new URLSearchParams({
      expires: Math.floor(Date.now() / 1000) + expiresIn,
      method,
      ...(contentType && { 'Content-Type': contentType }),
      ...(partNumber && { partNumber: partNumber.toString() }),
      ...(uploadId && { uploadId }),
      ...(variant && { variant }),
      ...(width && { width: width.toString() }),
      ...(height && { height: height.toString() })
    });
    
    return `https://${this.config.bucket}.${this.config.endpoint}/${key}?${params.toString()}`;
  }
}

// Утилиты для работы с ключами файлов
export class FileKeyUtils {
  // Генерация ключа для оригинального файла
  static getOriginalKey(chatId: string, fileId: string): string {
    return `chats/${chatId}/${fileId}/original`;
  }
  
  // Генерация ключа для миниатюры
  static getThumbnailKey(chatId: string, fileId: string, width: number, height: number): string {
    return `chats/${chatId}/${fileId}/thumb_${width}x${height}.webp`;
  }
  
  // Генерация ключа для постера видео
  static getPosterKey(chatId: string, fileId: string): string {
    return `chats/${chatId}/${fileId}/poster.jpg`;
  }
  
  // Генерация ключа для HLS плейлиста
  static getHlsKey(chatId: string, fileId: string): string {
    return `chats/${chatId}/${fileId}/hls/playlist.m3u8`;
  }
  
  // Генерация ключа для HLS сегмента
  static getHlsSegmentKey(chatId: string, fileId: string, segmentName: string): string {
    return `chats/${chatId}/${fileId}/hls/${segmentName}`;
  }
  
  // Извлечение chatId из ключа
  static extractChatId(key: string): string | null {
    const match = key.match(/^chats\/([^\/]+)\//);
    return match ? match[1] : null;
  }
  
  // Извлечение fileId из ключа
  static extractFileId(key: string): string | null {
    const match = key.match(/^chats\/[^\/]+\/([^\/]+)\//);
    return match ? match[1] : null;
  }
}

// Создание экземпляра хранилища
export function createChatMediaStorage(): ChatMediaStorage {
  const config: S3Config = {
    endpoint: process.env.S3_ENDPOINT || 's3.amazonaws.com',
    region: process.env.S3_REGION || 'us-east-1',
    bucket: process.env.S3_BUCKET || 'bridge-media',
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ''
  };
  
  return new ChatMediaStorage(config);
}
