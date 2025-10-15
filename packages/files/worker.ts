import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client, generateThumbnailKey } from './s3';
import { extractImageMetadata, generateImageThumbnail } from './image';
import { extractPdfMetadata, generatePdfThumbnail } from './pdf';
import { scanBufferWithClamAV } from './av';
import { FLAGS } from '@yp/shared';

export interface ProcessAttachmentJob {
  attachmentId: string;
  objectKey: string;
  mime: string;
  type: string;
}

export interface ProcessResult {
  success: boolean;
  metadata?: {
    width?: number;
    height?: number;
    pages?: number;
  };
  thumbKey?: string;
  avClean?: boolean;
  error?: string;
}

/**
 * Обрабатывает вложение: генерирует превью, извлекает метаданные, сканирует на вирусы
 */
export async function processAttachment(job: ProcessAttachmentJob): Promise<ProcessResult> {
  const s3Client = createS3Client({
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    region: process.env.S3_REGION || 'us-east-1',
    bucket: process.env.S3_BUCKET || 'yp-files',
    accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  });

  const bucket = process.env.S3_BUCKET || 'yp-files';

  try {
    console.log(`Processing attachment: ${job.attachmentId}`);

    // Скачиваем файл из S3
    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: job.objectKey,
    });

    const response = await s3Client.send(getCommand);
    if (!response.Body) {
      throw new Error('File not found in S3');
    }

    // Конвертируем stream в Buffer
    const chunks: Uint8Array[] = [];
    const stream = response.Body as NodeJS.ReadableStream;
    
    for await (const chunk of stream) {
      chunks.push(chunk as Uint8Array);
    }
    
    const buffer = Buffer.concat(chunks);

    const result: ProcessResult = {
      success: true,
    };

    // Антивирус сканирование
    if (FLAGS.AV_SCAN_ENABLED) {
      console.log(`Scanning ${job.attachmentId} for viruses...`);
      const avResult = await scanBufferWithClamAV(buffer);
      result.avClean = avResult.clean;
      
      if (!avResult.clean) {
        console.warn(`Virus detected in ${job.attachmentId}:`, avResult.threats);
        // Не блокируем обработку, но помечаем как зараженный
      }
    } else {
      result.avClean = true; // По умолчанию считаем чистым
    }

    // Обработка в зависимости от типа файла
    if (job.type === 'image' && FLAGS.IMAGE_THUMBS_ENABLED) {
      console.log(`Generating image thumbnail for ${job.attachmentId}`);
      
      // Извлекаем метаданные
      const metadata = await extractImageMetadata(buffer);
      result.metadata = {
        width: metadata.width,
        height: metadata.height,
      };

      // Генерируем превью
      const thumbnailBuffer = await generateImageThumbnail(buffer, {
        maxWidth: 512,
        maxHeight: 512,
        quality: 80,
        format: 'png',
      });

      // Загружаем превью в S3
      const thumbKey = generateThumbnailKey(job.attachmentId);
      const putCommand = new PutObjectCommand({
        Bucket: bucket,
        Key: thumbKey,
        Body: thumbnailBuffer,
        ContentType: 'image/png',
      });

      await s3Client.send(putCommand);
      result.thumbKey = thumbKey;

    } else if (job.type === 'pdf' && FLAGS.PDF_THUMBS_ENABLED) {
      console.log(`Generating PDF thumbnail for ${job.attachmentId}`);
      
      // Извлекаем метаданные
      const metadata = await extractPdfMetadata(buffer);
      result.metadata = {
        pages: metadata.pages,
      };

      // Генерируем превью первой страницы
      const thumbnailBuffer = await generatePdfThumbnail(buffer, {
        width: 512,
        height: 512,
        quality: 80,
        page: 1,
      });

      // Загружаем превью в S3
      const thumbKey = generateThumbnailKey(job.attachmentId);
      const putCommand = new PutObjectCommand({
        Bucket: bucket,
        Key: thumbKey,
        Body: thumbnailBuffer,
        ContentType: 'image/png',
      });

      await s3Client.send(putCommand);
      result.thumbKey = thumbKey;
    }

    console.log(`Successfully processed attachment: ${job.attachmentId}`);
    return result;

  } catch (error) {
    console.error(`Error processing attachment ${job.attachmentId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Обновляет метаданные вложения в БД
 * Примечание: Эта функция должна вызываться из контекста, где доступен db
 */
export async function updateAttachmentMetadata(
  attachmentId: string,
  result: ProcessResult,
  db: any // Prisma client
): Promise<void> {
  try {
    await db.attachment.update({
      where: { id: attachmentId },
      data: {
        width: result.metadata?.width,
        height: result.metadata?.height,
        pages: result.metadata?.pages,
        thumbKey: result.thumbKey,
        avClean: result.avClean,
        updatedAt: new Date(),
      },
    });

    console.log(`Updated metadata for attachment: ${attachmentId}`);
  } catch (error) {
    console.error(`Error updating attachment metadata ${attachmentId}:`, error);
    throw error;
  }
}

/**
 * Создает SystemCard для уведомления о завершении обработки
 * Примечание: Эта функция должна вызываться из контекста, где доступен db
 */
export async function createProcessingSystemCard(
  attachmentId: string,
  result: ProcessResult,
  db: any // Prisma client
): Promise<void> {
  try {
    // Находим attachment и связанное сообщение
    const attachment = await db.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        message: {
          include: {
            chat: true,
          },
        },
      },
    });

    if (!attachment || !attachment.message) {
      console.warn(`Attachment or message not found for ${attachmentId}`);
      return;
    }

    // Создаем SystemCard
    const systemCard = await db.message.create({
      data: {
        chatId: attachment.message.chatId,
        seq: 0, // будет обновлен триггером
        kind: 'system',
        payload: {
          kind: result.success ? 'file.processed' : 'file.processing.failed',
          data: {
            attachmentId,
            success: result.success,
            error: result.error,
            hasThumbnail: !!result.thumbKey,
            avClean: result.avClean,
          },
        },
        createdAt: new Date(),
      },
    });

    console.log(`Created system card for processing result: ${systemCard.id}`);
  } catch (error) {
    console.error(`Error creating system card for ${attachmentId}:`, error);
  }
}
