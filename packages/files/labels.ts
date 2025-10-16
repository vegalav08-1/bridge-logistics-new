import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

export interface LabelData {
  // Основная информация
  trackingNumber: string;
  orderNumber: string;
  qrCode: string;
  
  // Отправитель
  senderName: string;
  senderAddress: string;
  senderCity: string;
  senderCountry: string;
  senderPhone?: string;
  
  // Получатель
  recipientName: string;
  recipientAddress: string;
  recipientCity: string;
  recipientCountry: string;
  recipientPhone?: string;
  
  // Товар
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  description: string;
  value?: number;
  currency?: string;
  
  // Дополнительная информация
  specialInstructions?: string;
  serviceType?: string;
  deliveryDate?: string;
  barcode?: string;
}

export interface LabelOptions {
  format: 'A6' | 'A7';
  template?: 'standard' | 'express' | 'fragile';
  language?: 'ru' | 'en' | 'zh';
  includeQR?: boolean;
  includeBarcode?: boolean;
  includeLogo?: boolean;
}

export interface LabelResult {
  pdfBuffer: Buffer;
  labelId: string;
  format: string;
  dimensions: {
    width: number;
    height: number;
  };
}

/**
 * Размеры этикеток в мм
 */
const LABEL_DIMENSIONS = {
  A6: { width: 105, height: 148 },
  A7: { width: 74, height: 105 },
};

/**
 * Генерирует PDF этикетку
 */
export async function generateLabel(
  data: LabelData,
  options: LabelOptions = { format: 'A6' }
): Promise<LabelResult> {
  const {
    format = 'A6',
    template = 'standard',
    language = 'ru',
    includeQR = true,
    includeBarcode = true,
    includeLogo = true,
  } = options;

  try {
    // Создаем временные файлы
    const tempHtmlPath = join(tmpdir(), `label_${Date.now()}.html`);
    const tempPdfPath = join(tmpdir(), `label_${Date.now()}.pdf`);
    
    // Генерируем HTML для этикетки
    const html = generateLabelHTML(data, {
      format,
      template,
      language,
      includeQR,
      includeBarcode,
      includeLogo,
    });
    
    await writeFile(tempHtmlPath, html, 'utf8');
    
    try {
      // Конвертируем HTML в PDF с помощью wkhtmltopdf
      const dimensions = LABEL_DIMENSIONS[format];
      const command = [
        'wkhtmltopdf',
        '--page-size', format,
        '--margin-top', '0',
        '--margin-right', '0',
        '--margin-bottom', '0',
        '--margin-left', '0',
        '--disable-smart-shrinking',
        '--print-media-type',
        '--dpi', '300',
        tempHtmlPath,
        tempPdfPath
      ].join(' ');
      
      await execAsync(command);
      
      // Читаем сгенерированный PDF
      const pdfBuffer = await readFile(tempPdfPath);
      
      return {
        pdfBuffer,
        labelId: `label_${Date.now()}`,
        format,
        dimensions,
      };
    } finally {
      // Удаляем временные файлы
      await Promise.all([
        unlink(tempHtmlPath).catch(() => {}),
        unlink(tempPdfPath).catch(() => {})
      ]);
    }
  } catch (error) {
    console.error('Error generating label:', error);
    throw new Error('Failed to generate label');
  }
}

/**
 * Генерирует HTML для этикетки
 */
function generateLabelHTML(
  data: LabelData,
  options: {
    format: string;
    template: string;
    language: string;
    includeQR: boolean;
    includeBarcode: boolean;
    includeLogo: boolean;
  }
): string {
  const dimensions = LABEL_DIMENSIONS[options.format as 'A6' | 'A7'];
  
  return `
<!DOCTYPE html>
<html lang="${options.language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shipping Label</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            width: ${dimensions.width}mm;
            height: ${dimensions.height}mm;
            font-family: 'Arial', sans-serif;
            font-size: 8px;
            line-height: 1.2;
            color: #000;
            background: white;
            overflow: hidden;
        }
        
        .label {
            width: 100%;
            height: 100%;
            padding: 2mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #000;
            padding-bottom: 1mm;
            margin-bottom: 2mm;
        }
        
        .logo {
            font-weight: bold;
            font-size: 10px;
        }
        
        .tracking-number {
            font-weight: bold;
            font-size: 12px;
        }
        
        .addresses {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2mm;
        }
        
        .address {
            width: 48%;
        }
        
        .address-title {
            font-weight: bold;
            font-size: 9px;
            margin-bottom: 1mm;
            text-transform: uppercase;
        }
        
        .address-content {
            font-size: 8px;
            line-height: 1.3;
        }
        
        .package-info {
            border: 1px solid #000;
            padding: 1mm;
            margin-bottom: 2mm;
        }
        
        .package-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5mm;
        }
        
        .package-label {
            font-weight: bold;
        }
        
        .qr-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 2mm;
        }
        
        .qr-code {
            width: 20mm;
            height: 20mm;
            border: 1px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 6px;
            text-align: center;
        }
        
        .barcode {
            width: 40mm;
            height: 15mm;
            border: 1px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 6px;
        }
        
        .footer {
            text-align: center;
            font-size: 6px;
            margin-top: 1mm;
        }
        
        .special-instructions {
            background: #f0f0f0;
            padding: 1mm;
            margin-top: 1mm;
            font-size: 7px;
        }
    </style>
</head>
<body>
    <div class="label">
        <div class="header">
            <div class="logo">BRIDGE LOGISTICS</div>
            <div class="tracking-number">${data.trackingNumber}</div>
        </div>
        
        <div class="addresses">
            <div class="address">
                <div class="address-title">ОТПРАВИТЕЛЬ</div>
                <div class="address-content">
                    ${data.senderName}<br>
                    ${data.senderAddress}<br>
                    ${data.senderCity}, ${data.senderCountry}<br>
                    ${data.senderPhone ? `Тел: ${data.senderPhone}` : ''}
                </div>
            </div>
            
            <div class="address">
                <div class="address-title">ПОЛУЧАТЕЛЬ</div>
                <div class="address-content">
                    ${data.recipientName}<br>
                    ${data.recipientAddress}<br>
                    ${data.recipientCity}, ${data.recipientCountry}<br>
                    ${data.recipientPhone ? `Тел: ${data.recipientPhone}` : ''}
                </div>
            </div>
        </div>
        
        <div class="package-info">
            <div class="package-row">
                <span class="package-label">Вес:</span>
                <span>${data.weight} кг</span>
            </div>
            <div class="package-row">
                <span class="package-label">Размеры:</span>
                <span>${data.dimensions.length}×${data.dimensions.width}×${data.dimensions.height} см</span>
            </div>
            <div class="package-row">
                <span class="package-label">Описание:</span>
                <span>${data.description}</span>
            </div>
            ${data.value ? `
            <div class="package-row">
                <span class="package-label">Стоимость:</span>
                <span>${data.value} ${data.currency || 'USD'}</span>
            </div>
            ` : ''}
        </div>
        
        ${data.specialInstructions ? `
        <div class="special-instructions">
            <strong>Особые указания:</strong> ${data.specialInstructions}
        </div>
        ` : ''}
        
        <div class="qr-section">
            <div class="qr-code">
                QR CODE<br>
                ${data.qrCode}
            </div>
            <div class="barcode">
                BARCODE<br>
                ${data.barcode || data.trackingNumber}
            </div>
        </div>
        
        <div class="footer">
            ${data.serviceType ? `Тип услуги: ${data.serviceType}` : ''}
            ${data.deliveryDate ? ` | Дата доставки: ${data.deliveryDate}` : ''}
        </div>
    </div>
</body>
</html>`;
}

/**
 * Генерирует QR код для этикетки
 */
export function generateQRCode(data: string): string {
  // В реальной реализации здесь будет генерация QR кода
  // Пока возвращаем простую строку
  return `QR:${data}`;
}

/**
 * Генерирует штрих-код для этикетки
 */
export function generateBarcode(data: string): string {
  // В реальной реализации здесь будет генерация штрих-кода
  // Пока возвращаем простую строку
  return `BC:${data}`;
}

/**
 * Валидирует данные этикетки
 */
export function validateLabelData(data: LabelData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.trackingNumber) {
    errors.push('Tracking number is required');
  }
  
  if (!data.senderName) {
    errors.push('Sender name is required');
  }
  
  if (!data.recipientName) {
    errors.push('Recipient name is required');
  }
  
  if (!data.weight || data.weight <= 0) {
    errors.push('Weight must be greater than 0');
  }
  
  if (!data.description) {
    errors.push('Description is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Создает этикетку для отгрузки
 */
export async function createShipmentLabel(
  shipmentId: string,
  data: Omit<LabelData, 'trackingNumber' | 'orderNumber' | 'qrCode'>
): Promise<LabelResult> {
  const trackingNumber = `BR${Date.now().toString().slice(-8)}`;
  const orderNumber = `ORD${shipmentId.slice(-6)}`;
  const qrCode = generateQRCode(trackingNumber);
  
  const labelData: LabelData = {
    ...data,
    trackingNumber,
    orderNumber,
    qrCode,
    barcode: generateBarcode(trackingNumber),
  };
  
  const validation = validateLabelData(labelData);
  if (!validation.valid) {
    throw new Error(`Invalid label data: ${validation.errors.join(', ')}`);
  }
  
  return generateLabel(labelData, {
    format: 'A6',
    template: 'standard',
    language: 'ru',
    includeQR: true,
    includeBarcode: true,
    includeLogo: true,
  });
}




