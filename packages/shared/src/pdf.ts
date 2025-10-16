/**
 * Утилиты для генерации PDF этикеток
 * В S6 генерируем в памяти, в S7 перенесём в S3
 */

export interface QRLabelData {
  code: string;
  chatNumber: string;
  shipmentId: string;
  description?: string;
  weight?: number;
  boxes?: number;
}

/**
 * Генерирует SVG для QR кода (заглушка, в реальности используем qrcode библиотеку)
 */
export function generateQRSVG(code: string): string {
  // Временная заглушка - в реальности используем библиотеку qrcode
  return `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white" stroke="black" stroke-width="2"/>
      <text x="100" y="100" text-anchor="middle" font-family="monospace" font-size="12">
        ${code}
      </text>
    </svg>
  `;
}

/**
 * Генерирует HTML для PDF этикетки
 */
export function generateLabelHTML(data: QRLabelData): string {
  const qrSVG = generateQRSVG(data.code);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          width: 400px;
          height: 600px;
        }
        .label {
          border: 2px solid #000;
          padding: 15px;
          text-align: center;
        }
        .qr-code {
          margin: 20px 0;
        }
        .code {
          font-family: monospace;
          font-size: 18px;
          font-weight: bold;
          margin: 10px 0;
        }
        .info {
          font-size: 14px;
          margin: 5px 0;
        }
        .chat-number {
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }
      </style>
    </head>
    <body>
      <div class="label">
        <div class="chat-number">#${data.chatNumber}</div>
        <div class="qr-code">${qrSVG}</div>
        <div class="code">${data.code}</div>
        ${data.description ? `<div class="info">${data.description}</div>` : ''}
        ${data.weight ? `<div class="info">Вес: ${data.weight} кг</div>` : ''}
        ${data.boxes ? `<div class="info">Коробок: ${data.boxes}</div>` : ''}
        <div class="info">ID: ${data.shipmentId}</div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Генерирует PDF в памяти (заглушка для S6)
 * В реальности используем puppeteer или другую библиотеку
 */
export async function generatePDF(html: string): Promise<Buffer> {
  // Временная заглушка - возвращаем HTML как Buffer
  // В реальности используем puppeteer для генерации PDF
  return Buffer.from(html, 'utf-8');
}

/**
 * Генерирует полную PDF этикетку
 */
export async function generateQRLabelPDF(data: QRLabelData): Promise<Buffer> {
  const html = generateLabelHTML(data);
  return generatePDF(html);
}








