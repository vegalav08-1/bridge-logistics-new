const sharp = require('sharp');

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface ThumbnailOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'png' | 'jpeg' | 'webp';
}

/**
 * Извлекает метаданные изображения
 */
export async function extractImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
  const metadata = await sharp(buffer).metadata();
  
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: buffer.length,
  };
}

/**
 * Генерирует превью изображения
 */
export async function generateImageThumbnail(
  buffer: Buffer,
  options: ThumbnailOptions = {}
): Promise<Buffer> {
  const {
    maxWidth = 512,
    maxHeight = 512,
    quality = 80,
    format = 'png'
  } = options;

  let sharpInstance = sharp(buffer);

  // Получаем размеры оригинального изображения
  const metadata = await sharpInstance.metadata();
  const { width = 0, height = 0 } = metadata;

  // Вычисляем размеры превью с сохранением пропорций
  let thumbWidth = maxWidth;
  let thumbHeight = maxHeight;

  if (width > height) {
    thumbHeight = Math.round((height * maxWidth) / width);
  } else {
    thumbWidth = Math.round((width * maxHeight) / height);
  }

  // Применяем ресайз
  sharpInstance = sharpInstance.resize(thumbWidth, thumbHeight, {
    fit: 'inside',
    withoutEnlargement: true,
  });

  // Применяем формат и качество
  switch (format) {
    case 'jpeg':
      sharpInstance = sharpInstance.jpeg({ quality });
      break;
    case 'webp':
      sharpInstance = sharpInstance.webp({ quality });
      break;
    case 'png':
    default:
      sharpInstance = sharpInstance.png({ quality });
      break;
  }

  return sharpInstance.toBuffer();
}

/**
 * Конвертирует HEIC в WebP
 */
export async function convertHeicToWebp(buffer: Buffer, quality: number = 80): Promise<Buffer> {
  return sharp(buffer)
    .webp({ quality })
    .toBuffer();
}

/**
 * Проверяет, является ли изображение валидным
 */
export async function validateImage(buffer: Buffer): Promise<boolean> {
  try {
    await sharp(buffer).metadata();
    return true;
  } catch {
    return false;
  }
}

/**
 * Оптимизирует изображение для веба
 */
export async function optimizeImageForWeb(
  buffer: Buffer,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 85
): Promise<Buffer> {
  const metadata = await sharp(buffer).metadata();
  const { width = 0, height = 0 } = metadata;

  let sharpInstance = sharp(buffer);

  // Ресайз только если изображение больше максимальных размеров
  if (width > maxWidth || height > maxHeight) {
    sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Конвертируем в WebP для лучшего сжатия
  return sharpInstance
    .webp({ quality })
    .toBuffer();
}
