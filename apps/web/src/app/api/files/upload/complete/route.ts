import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { completeUploadSchema } from '@yp/api';
import { FLAGS } from '@yp/shared';
import { createS3Client, getObjectMetadata } from '@yp/files/s3';
import { getFileType } from '@yp/files/mime';
import { db } from '@yp/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Проверяем фиче-флаг
    if (!FLAGS.FILES_ENABLED) {
      return NextResponse.json(
        { error: 'File uploads are disabled' },
        { status: 403 }
      );
    }

    // Аутентификация
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { verifyAccess } = await import('@yp/api');
    const payload: any = verifyAccess(accessToken);
    const userId = payload.sub;

    // Валидация тела запроса
    const body = await request.json();
    const validatedData = completeUploadSchema.parse(body);

    // Находим attachment
    const attachment = await db.attachment.findFirst({
      where: {
        id: validatedData.attachmentId,
        messageId: null, // только draft
      } as any,
      include: {
        chat: true,
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: 'Attachment not found or already completed' },
        { status: 404 }
      );
    }

    // Проверяем доступ к чату
    const chat = await db.chat.findFirst({
      where: {
        id: attachment.chatId,
        members: {
          some: {
            userId: userId,
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Проверяем, что файл действительно загружен в S3
    const s3Client = createS3Client({
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      region: process.env.S3_REGION || 'us-east-1',
      bucket: process.env.S3_BUCKET || 'bridge-files',
      accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
      secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    });

    try {
      const metadata = await getObjectMetadata(
        s3Client,
        process.env.S3_BUCKET || 'bridge-files',
        attachment.objectKey
      );

      // Проверяем размер файла
      if (metadata.contentLength !== attachment.bytes) {
        return NextResponse.json(
          { error: 'File size mismatch' },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'File not found in storage' },
        { status: 404 }
      );
    }

    // Проверяем идемпотентность по clientId
    const existingMessage = await db.message.findFirst({
      where: {
        chatId: attachment.chatId,
        clientId: validatedData.clientId,
      },
    });

    if (existingMessage) {
      // Обновляем attachment с существующим messageId
      await db.attachment.update({
        where: { id: attachment.id },
        data: { messageId: existingMessage.id },
      });

      return NextResponse.json({
        message: {
          id: existingMessage.id,
          chatId: existingMessage.chatId,
          seq: existingMessage.seq,
          kind: existingMessage.kind,
          payload: existingMessage.payload,
        },
      });
    }

    // Определяем тип сообщения
    let messageKind: 'image' | 'file' | 'video' = 'file';
    const fileType = getFileType(attachment.mime);
    
    if (fileType === 'image') {
      messageKind = 'image';
    } else if (fileType === 'video') {
      messageKind = 'video';
    }

    // Создаем сообщение
    const message = await db.message.create({
      data: {
        chatId: attachment.chatId,
        seq: 0, // будет обновлен триггером
        kind: messageKind,
        payload: JSON.stringify({
          attachmentId: attachment.id,
          name: attachment.objectKey.split('/').pop() || 'file',
          mime: attachment.mime,
          bytes: attachment.bytes,
        }),
        clientId: validatedData.clientId,
        createdAt: new Date(),
      },
    });

    // Обновляем attachment с messageId
    await db.attachment.update({
      where: { id: attachment.id },
      data: { messageId: message.id },
    });

    // Обновляем время последнего обновления чата
    await db.chat.update({
      where: { id: attachment.chatId },
      data: { updatedAt: new Date() },
    });

    // Логируем завершение загрузки
    console.log(`File upload completed: ${attachment.id} -> message ${message.id} in chat ${attachment.chatId}`);

    // TODO: Поставить job в очередь для генерации превью и AV скана
    // await queuePreviewJob(attachment.id);

    return NextResponse.json({
      message: {
        id: message.id,
        chatId: message.chatId,
        seq: message.seq,
        kind: message.kind,
        payload: message.payload,
      },
    });

  } catch (error) {
    console.error('Error completing upload:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
