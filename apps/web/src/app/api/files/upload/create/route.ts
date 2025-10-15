import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createUploadSessionSchema } from '@yp/api';
import { FLAGS } from '@yp/shared';
import { createS3Client, getPresignedPut, generateObjectKey } from '@yp/files/s3';
import { getFileType } from '@yp/files/mime';
import { db } from '@yp/db';

export async function POST(request: NextRequest) {
  try {
    // Проверяем фиче-флаг
    if (!FLAGS.FILES_ENABLED || !FLAGS.PRESIGNED_UPLOADS_ENABLED) {
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
    const validatedData = createUploadSessionSchema.parse(body);

    // Проверяем, что пользователь является участником чата
    const chat = await db.chat.findFirst({
      where: {
        id: validatedData.chatId,
        members: {
          some: {
            userId: userId,
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found or access denied' },
        { status: 404 }
      );
    }

    // Определяем тип файла
    const fileType = getFileType(validatedData.mime);

    // Создаем Attachment в статусе draft
    const attachment = await db.attachment.create({
      data: {
        chatId: validatedData.chatId,
        messageId: null, // draft - будет установлен позже
        type: fileType,
        objectKey: '', // будет заполнен после генерации presigned URL
        mime: validatedData.mime,
        bytes: validatedData.bytes,
        hash: validatedData.sha256,
        uploadedAt: new Date(),
      } as any,
    });

    // Генерируем objectKey
    const objectKey = generateObjectKey(validatedData.chatId, attachment.id, validatedData.fileName);

    // Обновляем attachment с objectKey
    await db.attachment.update({
      where: { id: attachment.id },
      data: { objectKey },
    });

    // Создаем S3 клиент
    const s3Client = createS3Client({
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      region: process.env.S3_REGION || 'us-east-1',
      bucket: process.env.S3_BUCKET || 'bridge-files',
      accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
      secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin123',
      forcePathStyle: true,
    });

    // Генерируем presigned PUT URL
    const putUrl = await getPresignedPut(s3Client, process.env.S3_BUCKET || 'bridge-files', {
      objectKey,
      contentType: validatedData.mime,
      expiresIn: 300, // 5 минут
    });

    // Логируем создание upload сессии
    console.log(`File upload session created: ${attachment.id} for chat ${validatedData.chatId} by user ${userId}`);

    return NextResponse.json({
      attachmentId: attachment.id,
      putUrl,
      objectKey,
      headers: {
        'Content-Type': validatedData.mime,
      },
      maxChunkBytes: 10 * 1024 * 1024, // 10MB
    });

  } catch (error) {
    console.error('Error creating upload session:', error);

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
