import type { OcrResult } from '@/lib/search/types';

let workerLoaded = false;

export async function runOCR(imageBlob: Blob, onProgress?: (p:number)=>void): Promise<OcrResult> {
  // Заглушка: имитация OCR
  onProgress?.(0.1);
  await new Promise(r=>setTimeout(r,300));
  onProgress?.(0.7);
  await new Promise(r=>setTimeout(r,300));
  return {
    text: 'LP123456\nИван Иванов\nМосква, Тверская 1',
    fields: { trackOld:'LP123456', recipientName:'Иван Иванов', address:'Москва, Тверская 1' },
    confidence: 0.82
  };
}


