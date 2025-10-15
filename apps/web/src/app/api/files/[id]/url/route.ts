import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFileUrlSchema } from '@yp/api';
import { FLAGS } from '@yp/shared';
import { createS3Client, getPresignedGet } from '@yp/files/s3';
import { db } from '@yp/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Проверяем фиче-флаг
    if (!FLAGS.FILES_ENABLED) {
      return NextResponse.json(
        { error: 'File access is disabled' },
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

    // Валидация параметров
    const { searchParams } = new URL(request.url);
    const validatedData = getFileUrlSchema.parse({
      attachmentId: params.id,
      thumb: searchParams.get('thumb') === '1',
    });

    // Находим attachment
    const attachment = await db.attachment.findFirst({
      where: {
        id: validatedData.attachmentId,
      },
      include: {
        chat: true,
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Проверяем доступ к чату через ChatMember
    const chatMember = await db.chatMember.findFirst({
      where: {
        chatId: attachment.chatId,
        userId: userId,
      },
    });

    if (!chatMember) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Определяем, какой файл запрашиваем
    let objectKey = attachment.objectKey;
    
    if (validatedData.thumb && (attachment as any).thumbKey) {
      objectKey = (attachment as any).thumbKey;
    } else if (validatedData.thumb && !(attachment as any).thumbKey) {
      return NextResponse.json(
        { error: 'Thumbnail not available' },
        { status: 404 }
      );
    }

    // Создаем S3 клиент
    const s3Client = createS3Client({
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      region: process.env.S3_REGION || 'us-east-1',
      bucket: process.env.S3_BUCKET || 'bridge-files',
      accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
      secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    });

    // Генерируем presigned GET URL
    const getUrl = await getPresignedGet(s3Client, process.env.S3_BUCKET || 'bridge-files', {
      objectKey,
      expiresIn: 300, // 5 минут
    });

    // Логируем доступ к файлу
    console.log(`File access granted: ${attachment.id} (${validatedData.thumb ? 'thumb' : 'original'}) for user ${userId}`);

    return NextResponse.json({
      url: getUrl,
      expiresIn: 300,
    });

  } catch (error) {
    console.error('Error getting file URL:', error);

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
