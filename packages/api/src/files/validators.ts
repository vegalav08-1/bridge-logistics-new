import { z } from 'zod';
import { validateMimeType, getMaxSizeForMime, isAllowedMimeType } from '@yp/files/mime';

// Валидация для создания upload сессии
export const createUploadSessionSchema = z.object({
  chatId: z.string().cuid('Неверный формат ID чата'),
  fileName: z.string()
    .min(1, 'Имя файла не может быть пустым')
    .max(255, 'Имя файла не должно превышать 255 символов')
    .regex(/^[^<>:"/\\|?*]+$/, 'Имя файла содержит недопустимые символы'),
  mime: z.string()
    .min(1, 'MIME тип не может быть пустым')
    .refine((mime) => isAllowedMimeType(mime), {
      message: 'Тип файла не поддерживается'
    }),
  bytes: z.number()
    .int('Размер файла должен быть целым числом')
    .min(1, 'Размер файла должен быть больше 0')
    .refine((bytes) => {
      // Проверка размера будет выполнена в API endpoint
      return bytes > 0;
    }, {
      message: 'Размер файла должен быть больше 0'
    }),
  sha256: z.string()
    .regex(/^[a-f0-9]{64}$/i, 'SHA256 хэш должен быть 64-символьной hex строкой')
    .optional(),
  kind: z.enum(['image', 'file', 'video', 'auto']).default('auto'),
});

// Валидация для завершения загрузки
export const completeUploadSchema = z.object({
  attachmentId: z.string().cuid('Неверный формат ID вложения'),
  clientId: z.string().uuid('Неверный формат client ID'),
  as: z.enum(['image', 'file', 'video', 'auto']).default('auto'),
});

// Валидация для получения presigned URL
export const getFileUrlSchema = z.object({
  attachmentId: z.string().cuid('Неверный формат ID вложения'),
  thumb: z.boolean().optional().default(false),
});

// Валидация для удаления файла
export const deleteFileSchema = z.object({
  attachmentId: z.string().cuid('Неверный формат ID вложения'),
});

// Валидация для обновления метаданных файла
export const updateFileMetadataSchema = z.object({
  attachmentId: z.string().cuid('Неверный формат ID вложения'),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  pages: z.number().int().positive().optional(),
  thumbKey: z.string().optional(),
  avClean: z.boolean().optional(),
});

// Валидация для массовой загрузки
export const createBulkUploadSessionSchema = z.object({
  chatId: z.string().cuid('Неверный формат ID чата'),
  files: z.array(z.object({
    fileName: z.string()
      .min(1, 'Имя файла не может быть пустым')
      .max(255, 'Имя файла не должно превышать 255 символов'),
    mime: z.string()
      .min(1, 'MIME тип не может быть пустым')
      .refine((mime) => isAllowedMimeType(mime), {
        message: 'Тип файла не поддерживается'
      }),
    bytes: z.number()
      .int('Размер файла должен быть целым числом')
      .min(1, 'Размер файла должен быть больше 0'),
    sha256: z.string()
      .regex(/^[a-f0-9]{64}$/i, 'SHA256 хэш должен быть 64-символьной hex строкой')
      .optional(),
  }))
    .min(1, 'Должен быть указан хотя бы один файл')
    .max(10, 'Максимум 10 файлов за раз'),
});

// Валидация для поиска файлов
export const searchFilesSchema = z.object({
  chatId: z.string().cuid('Неверный формат ID чата').optional(),
  type: z.enum(['image', 'pdf', 'doc', 'sheet', 'video', 'other']).optional(),
  mime: z.string().optional(),
  search: z.string().min(1).max(100).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// Валидация для получения статистики файлов
export const getFileStatsSchema = z.object({
  chatId: z.string().cuid('Неверный формат ID чата').optional(),
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
});

// Утилиты для валидации
export function validateFileSize(bytes: number, mime: string): boolean {
  const maxSizeMB = getMaxSizeForMime(mime);
  const maxBytes = maxSizeMB * 1024 * 1024;
  return bytes <= maxBytes;
}

export function validateFileName(fileName: string): boolean {
  // Проверяем на недопустимые символы
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(fileName)) {
    return false;
  }
  
  // Проверяем на зарезервированные имена Windows
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ];
  
  const nameWithoutExt = fileName.split('.')[0].toUpperCase();
  if (reservedNames.includes(nameWithoutExt)) {
    return false;
  }
  
  return true;
}

export function sanitizeFileName(fileName: string): string {
  // Удаляем недопустимые символы
  let sanitized = fileName.replace(/[<>:"/\\|?*]/g, '_');
  
  // Удаляем пробелы в начале и конце
  sanitized = sanitized.trim();
  
  // Ограничиваем длину
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop();
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    const maxNameLength = 255 - (ext ? ext.length + 1 : 0);
    sanitized = nameWithoutExt.substring(0, maxNameLength) + (ext ? `.${ext}` : '');
  }
  
  return sanitized;
}
