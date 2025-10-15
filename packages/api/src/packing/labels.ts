import { db } from '@yp/db';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { uploadFile, createS3Client } from '@yp/files/s3';
import { PackingEventService } from './events';

export interface LabelData {
  parcelCode: string;
  parcelName?: string;
  chatNumber: string;
  clientCode?: string;
  dimensions: string; // "L×W×H см"
  weight: string; // "X.X кг"
  pieces?: string; // "X шт"
  kind: string; // "box", "pallet", "crating"
  qrCode: string; // URL для QR кода
  barcode: string; // Code-128 штрих-код
}

export class LabelGenerator {
  static async generateLabel(parcelId: string): Promise<string> {
    // Получаем данные Parcel
    const parcel = await db.parcel.findUnique({
      where: { id: parcelId },
      include: {
        chat: {
          select: { number: true }
        }
      }
    });

    if (!parcel) {
      throw new Error('Parcel not found');
    }

    // Подготавливаем данные для этикетки
    const labelData: LabelData = {
      parcelCode: parcel.code,
      parcelName: parcel.name || undefined,
      chatNumber: parcel.chat.number,
      dimensions: this.formatDimensions(parcel.lengthCm, parcel.widthCm, parcel.heightCm),
      weight: parcel.weightKg ? `${parcel.weightKg} кг` : '',
      pieces: parcel.pieces ? `${parcel.pieces} шт` : undefined,
      kind: parcel.kind,
      qrCode: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/parcels/${parcel.id}`,
      barcode: parcel.code
    };

    // Генерируем PDF
    const pdfBytes = await this.createLabelPDF(labelData);
    
    // Загружаем в S3
    const objectKey = `labels/${parcel.chat.number}/${parcel.code}-${Date.now()}.pdf`;
    const s3Client = createS3Client({
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      region: process.env.S3_REGION || 'us-east-1',
      bucket: process.env.S3_BUCKET || 'bridge-files',
      accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
      secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin123',
      forcePathStyle: true
    });
    await uploadFile(
      s3Client,
      process.env.S3_BUCKET || 'bridge-files',
      objectKey,
      Buffer.from(pdfBytes),
      'application/pdf'
    );
    
    // Обновляем Parcel с ссылкой на этикетку
    await db.parcel.update({
      where: { id: parcelId },
      data: { labelKey: objectKey }
    });

    return `https://${process.env.S3_BUCKET || 'bridge-files'}.s3.amazonaws.com/${objectKey}`;
  }

  static async generateLabels(parcelIds: string[]): Promise<string[]> {
    const results = [];
    
    for (const parcelId of parcelIds) {
      try {
        const labelUrl = await this.generateLabel(parcelId);
        results.push(labelUrl);
      } catch (error) {
        console.error(`Error generating label for parcel ${parcelId}:`, error);
        // Продолжаем с остальными этикетками
      }
    }
    
    // Отправляем событие генерации этикеток
    if (results.length > 0) {
      const firstParcel = await db.parcel.findUnique({
        where: { id: parcelIds[0] },
        select: { chatId: true }
      });
      
      if (firstParcel) {
        await PackingEventService.emitLabelsGenerated(
          firstParcel.chatId,
          parcelIds,
          results.length
        );
      }
    }
    
    return results;
  }

  private static formatDimensions(length?: number | null, width?: number | null, height?: number | null): string {
    if (!length || !width || !height) {
      return '—';
    }
    return `${length}×${width}×${height} см`;
  }

  private static async createLabelPDF(data: LabelData): Promise<Uint8Array> {
    // Создаем PDF документ (A7 размер: 74×105 мм)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([210, 297]); // A7 в точках (74×105 мм)
    
    const { width, height } = page.getSize();
    
    // Загружаем шрифты
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Цвета
    const black = rgb(0, 0, 0);
    const gray = rgb(0.5, 0.5, 0.5);
    
    let y = height - 20;
    
    // Логотип (заглушка)
    page.drawText('BRIDGE', {
      x: 10,
      y: y,
      size: 12,
      font: boldFont,
      color: black
    });
    y -= 20;
    
    // Код посылки (крупно)
    page.drawText(data.parcelCode, {
      x: 10,
      y: y,
      size: 16,
      font: boldFont,
      color: black
    });
    y -= 25;
    
    // Название посылки (если есть)
    if (data.parcelName) {
      page.drawText(data.parcelName, {
        x: 10,
        y: y,
        size: 10,
        font: font,
        color: black
      });
      y -= 15;
    }
    
    // Номер отгрузки
    page.drawText(`Отгрузка: ${data.chatNumber}`, {
      x: 10,
      y: y,
      size: 9,
      font: font,
      color: gray
    });
    y -= 12;
    
    // Габариты
    page.drawText(`Размеры: ${data.dimensions}`, {
      x: 10,
      y: y,
      size: 8,
      font: font,
      color: black
    });
    y -= 10;
    
    // Вес
    if (data.weight) {
      page.drawText(`Вес: ${data.weight}`, {
        x: 10,
        y: y,
        size: 8,
        font: font,
        color: black
      });
      y -= 10;
    }
    
    // Количество
    if (data.pieces) {
      page.drawText(`Шт: ${data.pieces}`, {
        x: 10,
        y: y,
        size: 8,
        font: font,
        color: black
      });
      y -= 10;
    }
    
    // Тип упаковки
    const kindText = {
      'box': 'Коробка',
      'pallet': 'Палета',
      'crating': 'Обрешетка'
    }[data.kind] || data.kind;
    
    page.drawText(`Тип: ${kindText}`, {
      x: 10,
      y: y,
      size: 8,
      font: font,
      color: black
    });
    y -= 15;
    
    // QR код (заглушка - просто текст)
    page.drawText('QR:', {
      x: 10,
      y: y,
      size: 6,
      font: font,
      color: gray
    });
    page.drawText(data.qrCode, {
      x: 25,
      y: y,
      size: 6,
      font: font,
      color: gray
    });
    y -= 8;
    
    // Штрих-код (заглушка)
    page.drawText('Штрих:', {
      x: 10,
      y: y,
      size: 6,
      font: font,
      color: gray
    });
    page.drawText(data.barcode, {
      x: 35,
      y: y,
      size: 6,
      font: font,
      color: gray
    });
    
    return await pdfDoc.save();
  }
}
