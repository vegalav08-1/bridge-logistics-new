import { createHash } from 'crypto';

/**
 * Генерирует код клиента из email (6 символов base36)
 */
export function makeClientCode(userEmail: string): string {
  const hash = createHash('sha256').update(userEmail.toLowerCase()).digest('hex');
  // Берём первые 6 символов и конвертируем в base36
  const num = parseInt(hash.substring(0, 8), 16);
  return num.toString(36).toUpperCase().substring(0, 6);
}

/**
 * Форматирует код отгрузки в формате BRYYYYMMDD_seq_boxes(CLIENT)
 */
export function formatShipmentCode(
  date: Date,
  seq: number,
  boxes: number,
  clientCode: string
): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  return `BR${dateStr}_${seq}_${boxes}(${clientCode})`;
}

/**
 * Генерирует QR код для отгрузки
 */
export function generateShipmentQR(
  userEmail: string,
  date: Date = new Date(),
  seq: number = 1,
  boxes: number = 0
): string {
  const clientCode = makeClientCode(userEmail);
  return formatShipmentCode(date, seq, boxes, clientCode);
}

/**
 * Парсит QR код и возвращает компоненты
 */
export function parseShipmentCode(code: string): {
  date: Date;
  seq: number;
  boxes: number;
  clientCode: string;
} | null {
  const match = code.match(/^BR(\d{8})_(\d+)_(\d+)\(([A-Z0-9]+)\)$/);
  if (!match) {
    return null;
  }

  const [, dateStr, seqStr, boxesStr, clientCode] = match;
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1; // JS months are 0-based
  const day = parseInt(dateStr.substring(6, 8));
  
  return {
    date: new Date(year, month, day),
    seq: parseInt(seqStr),
    boxes: parseInt(boxesStr),
    clientCode,
  };
}








