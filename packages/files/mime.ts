export type FileType = 'image' | 'pdf' | 'doc' | 'sheet' | 'video' | 'other';

export interface MimeTypeInfo {
  type: FileType;
  allowed: boolean;
  maxSizeMB: number;
}

// Белый список MIME типов
export const MIME_TYPES: Record<string, MimeTypeInfo> = {
  // Изображения
  'image/jpeg': { type: 'image', allowed: true, maxSizeMB: 20 },
  'image/png': { type: 'image', allowed: true, maxSizeMB: 20 },
  'image/webp': { type: 'image', allowed: true, maxSizeMB: 20 },
  'image/heic': { type: 'image', allowed: true, maxSizeMB: 20 },
  'image/gif': { type: 'image', allowed: true, maxSizeMB: 20 },
  
  // PDF
  'application/pdf': { type: 'pdf', allowed: true, maxSizeMB: 50 },
  
  // Документы
  'application/msword': { type: 'doc', allowed: true, maxSizeMB: 50 },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { type: 'doc', allowed: true, maxSizeMB: 50 },
  
  // Таблицы
  'application/vnd.ms-excel': { type: 'sheet', allowed: true, maxSizeMB: 50 },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { type: 'sheet', allowed: true, maxSizeMB: 50 },
  'text/csv': { type: 'sheet', allowed: true, maxSizeMB: 50 },
  
  // Видео
  'video/mp4': { type: 'video', allowed: true, maxSizeMB: 200 },
  'video/quicktime': { type: 'video', allowed: true, maxSizeMB: 200 },
  'video/webm': { type: 'video', allowed: true, maxSizeMB: 200 },
  'video/avi': { type: 'video', allowed: true, maxSizeMB: 200 },
  
  // Текстовые файлы
  'text/plain': { type: 'other', allowed: true, maxSizeMB: 10 },
  'text/markdown': { type: 'other', allowed: true, maxSizeMB: 10 },
  
  // Архивы (опционально)
  'application/zip': { type: 'other', allowed: true, maxSizeMB: 100 },
  'application/x-rar-compressed': { type: 'other', allowed: true, maxSizeMB: 100 },
};

export function validateMimeType(mime: string): MimeTypeInfo | null {
  const info = MIME_TYPES[mime.toLowerCase()];
  return info || null;
}

export function getFileType(mime: string): FileType {
  const info = validateMimeType(mime);
  return info?.type || 'other';
}

export function isAllowedMimeType(mime: string): boolean {
  const info = validateMimeType(mime);
  return info?.allowed || false;
}

export function getMaxSizeForMime(mime: string): number {
  const info = validateMimeType(mime);
  return info?.maxSizeMB || 50; // default 50MB
}

export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot >= 0 ? fileName.substring(lastDot + 1).toLowerCase() : '';
}

export function getMimeFromExtension(extension: string): string | null {
  const ext = extension.toLowerCase();
  
  const extensionMap: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'heic': 'image/heic',
    'gif': 'image/gif',
    
    // PDF
    'pdf': 'application/pdf',
    
    // Documents
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    
    // Sheets
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'csv': 'text/csv',
    
    // Video
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'webm': 'video/webm',
    'avi': 'video/avi',
    
    // Text
    'txt': 'text/plain',
    'md': 'text/markdown',
    
    // Archives
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
  };
  
  return extensionMap[ext] || null;
}

export function getFileIcon(type: FileType): string {
  const icons: Record<FileType, string> = {
    image: '🖼️',
    pdf: '📄',
    doc: '📝',
    sheet: '📊',
    video: '🎥',
    other: '📎',
  };
  
  return icons[type] || '📎';
}




