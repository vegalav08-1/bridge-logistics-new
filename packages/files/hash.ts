import { createHash } from 'crypto';

/**
 * Вычисляет SHA256 хэш для файла
 */
export function calculateFileHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

/**
 * Вычисляет SHA256 хэш для строки
 */
export function calculateStringHash(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * Проверяет, является ли хэш валидным SHA256
 */
export function isValidSha256(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash);
}

/**
 * Создает короткий хэш для использования в именах файлов
 */
export function createShortHash(input: string, length: number = 8): string {
  const hash = calculateStringHash(input);
  return hash.substring(0, length);
}







