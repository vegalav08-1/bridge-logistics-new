import { z } from 'zod';

// CH-01: Media Storage Foundation - Zod схемы

// Типы медиа-файлов
export const MediaKindSchema = z.enum([
  'image',
  'video', 
  'pdf',
  'doc',
  'sheet',
  'audio',
  'other'
]);

// Базовые метаданные файла
export const FileMetadataSchema = z.object({
  name: z.string().min(1).max(200),
  size: z.number().int().positive().max(200 * 1024 * 1024), // 200MB лимит
  mime: z.string().min(1).max(100),
  sha256: z.string().length(64).regex(/^[a-f0-9]+$/i),
});

// Метаданные изображения
export const ImageMetadataSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  orientation: z.number().int().min(1).max(8).optional(),
  exif: z.record(z.any()).optional(),
  hasAlpha: z.boolean().optional(),
});

// Метаданные видео
export const VideoMetadataSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  duration: z.number().int().positive(), // в миллисекундах
  fps: z.number().positive().optional(),
  codec: z.string().optional(),
  bitrate: z.number().int().positive().optional(),
});

// Метаданные аудио
export const AudioMetadataSchema = z.object({
  duration: z.number().int().positive(), // в миллисекундах
  bitrate: z.number().int().positive().optional(),
  sampleRate: z.number().int().positive().optional(),
  channels: z.number().int().min(1).max(8).optional(),
});

// Метаданные документа
export const DocumentMetadataSchema = z.object({
  pages: z.number().int().positive().optional(),
  title: z.string().optional(),
  author: z.string().optional(),
  subject: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  language: z.string().optional(),
});

// Общие метаданные файла
export const FileMetaJsonSchema = z.object({
  // Общие поля
  originalName: z.string().optional(),
  uploadedAt: z.string().datetime().optional(),
  
  // Специфичные метаданные
  image: ImageMetadataSchema.optional(),
  video: VideoMetadataSchema.optional(),
  audio: AudioMetadataSchema.optional(),
  document: DocumentMetadataSchema.optional(),
  
  // Дополнительные поля
  tags: z.array(z.string()).optional(),
  description: z.string().max(1000).optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional(),
  }).optional(),
});

// Схема для инициализации загрузки
export const UploadInitSchema = z.object({
  chatId: z.string().uuid(),
  name: z.string().min(1).max(200),
  size: z.number().int().positive().max(200 * 1024 * 1024),
  mime: z.string().min(1).max(100),
  sha256: z.string().length(64).regex(/^[a-f0-9]+$/i),
  kind: MediaKindSchema,
  meta: FileMetaJsonSchema.optional(),
});

// Схема для завершения загрузки
export const UploadCompleteSchema = z.object({
  fileId: z.string().uuid(),
  uploadId: z.string().min(1),
  parts: z.array(z.object({
    partNumber: z.number().int().positive(),
    etag: z.string().min(1),
  })).min(1),
});

// Схема для получения URL файла
export const FileUrlSchema = z.object({
  fileId: z.string().uuid(),
  variant: z.enum(['original', 'thumb', 'poster', 'hls']).default('original'),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  expiresIn: z.number().int().positive().max(3600).default(3600), // 1 час по умолчанию
});

// Схема для поиска файлов
export const FileSearchSchema = z.object({
  chatId: z.string().uuid(),
  kind: MediaKindSchema.optional(),
  mime: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  uploaderId: z.string().uuid().optional(),
  limit: z.number().int().positive().max(100).default(20),
  cursor: z.string().optional(),
});

// Схема для создания файла в БД
export const CreateFileSchema = z.object({
  chatId: z.string().uuid(),
  messageId: z.string().uuid().optional(),
  uploaderId: z.string().uuid(),
  kind: MediaKindSchema,
  name: z.string().min(1).max(200),
  sizeBytes: z.number().int().positive(),
  mime: z.string().min(1).max(100),
  sha256: z.string().length(64).regex(/^[a-f0-9]+$/i),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  durationMs: z.number().int().positive().optional(),
  metaJson: z.record(z.any()).default({}),
  storageKey: z.string().min(1),
});

// Схема для обновления файла
export const UpdateFileSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  metaJson: z.record(z.any()).optional(),
});

// Типы TypeScript
export type MediaKind = z.infer<typeof MediaKindSchema>;
export type FileMetadata = z.infer<typeof FileMetadataSchema>;
export type ImageMetadata = z.infer<typeof ImageMetadataSchema>;
export type VideoMetadata = z.infer<typeof VideoMetadataSchema>;
export type AudioMetadata = z.infer<typeof AudioMetadataSchema>;
export type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>;
export type FileMetaJson = z.infer<typeof FileMetaJsonSchema>;
export type UploadInit = z.infer<typeof UploadInitSchema>;
export type UploadComplete = z.infer<typeof UploadCompleteSchema>;
export type FileUrl = z.infer<typeof FileUrlSchema>;
export type FileSearch = z.infer<typeof FileSearchSchema>;
export type CreateFile = z.infer<typeof CreateFileSchema>;
export type UpdateFile = z.infer<typeof UpdateFileSchema>;

// Вспомогательные функции для валидации
export const validateFileType = (mime: string, kind: MediaKind): boolean => {
  const mimeMap: Record<MediaKind, string[]> = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'],
    video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
    pdf: ['application/pdf'],
    doc: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    sheet: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
    other: []
  };
  
  return mimeMap[kind].includes(mime);
};

export const getFileKindFromMime = (mime: string): MediaKind => {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.includes('word') || mime.includes('document')) return 'doc';
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'sheet';
  return 'other';
};

export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export const getFileIcon = (kind: MediaKind): string => {
  const icons: Record<MediaKind, string> = {
    image: '🖼️',
    video: '🎬',
    pdf: '📄',
    doc: '📝',
    sheet: '📊',
    audio: '🎵',
    other: '📎'
  };
  
  return icons[kind];
};
