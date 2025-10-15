// Утилиты для работы с изображениями в офлайн режиме

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
  stripExif?: boolean;
}

export interface CompressedImage {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  dimensions: { width: number; height: number };
}

/**
 * Сжимает изображение с сохранением качества
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<CompressedImage> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.8,
    format = 'image/jpeg',
    stripExif = true
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        // Вычисляем новые размеры с сохранением пропорций
        const { width: newWidth, height: newHeight } = calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );

        // Устанавливаем размеры canvas
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Рисуем изображение на canvas
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Конвертируем в blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const compressionRatio = (1 - blob.size / file.size) * 100;

            resolve({
              blob,
              originalSize: file.size,
              compressedSize: blob.size,
              compressionRatio,
              dimensions: { width: newWidth, height: newHeight }
            });
          },
          format,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Загружаем изображение
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Вычисляет размеры изображения с сохранением пропорций
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let { width, height } = { width: originalWidth, height: originalHeight };

  // Если изображение меньше максимальных размеров, оставляем как есть
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  // Вычисляем коэффициент масштабирования
  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio)
  };
}

/**
 * Создает превью изображения
 */
export async function createThumbnail(
  file: File,
  size: number = 200
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        // Вычисляем размеры для квадратного превью
        const { width, height } = calculateDimensions(
          img.width,
          img.height,
          size,
          size
        );

        canvas.width = size;
        canvas.height = size;

        // Центрируем изображение
        const x = (size - width) / 2;
        const y = (size - height) / 2;

        // Рисуем превью
        ctx.drawImage(img, x, y, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create thumbnail'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          0.7
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for thumbnail'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Определяет тип файла по MIME типу
 */
export function getFileType(mime: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('application/pdf') || 
      mime.startsWith('application/msword') ||
      mime.startsWith('application/vnd.openxmlformats') ||
      mime.startsWith('text/')) return 'document';
  return 'other';
}

/**
 * Проверяет, является ли файл изображением
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Проверяет, является ли файл видео
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

/**
 * Получает размер файла в человекочитаемом формате
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Проверяет, нужно ли сжимать файл
 */
export function shouldCompress(file: File, maxSize: number = 5 * 1024 * 1024): boolean {
  return isImageFile(file) && file.size > maxSize;
}

/**
 * Создает URL для превью файла
 */
export function createPreviewUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Освобождает URL превью
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Получает метаданные изображения
 */
export async function getImageMetadata(file: File): Promise<{
  width: number;
  height: number;
  aspectRatio: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image metadata'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Создает иконку для типа файла
 */
export function getFileIcon(mime: string): string {
  const type = getFileType(mime);
  
  switch (type) {
    case 'image': return '🖼️';
    case 'video': return '🎥';
    case 'audio': return '🎵';
    case 'document': return '📄';
    default: return '📎';
  }
}




