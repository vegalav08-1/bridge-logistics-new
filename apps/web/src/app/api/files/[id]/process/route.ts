import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { FLAGS } from '@yp/shared';
import { processAttachment, updateAttachmentMetadata, createProcessingSystemCard } from '@yp/files';
import { db } from '@yp/db';

const processFileSchema = z.object({
  attachmentId: z.string().cuid('Неверный формат ID вложения'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Проверяем фиче-флаг
    if (!FLAGS.FILES_ENABLED) {
      return NextResponse.json(
        { error: 'File processing is disabled' },
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
    const validatedData = processFileSchema.parse({
      attachmentId: params.id,
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
        { error: 'Attachment not found' },
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

    // Проверяем, что файл уже загружен
    if (!attachment.messageId) {
      return NextResponse.json(
        { error: 'Attachment not completed yet' },
        { status: 400 }
      );
    }

    // Создаем job для обработки
    const job = {
      attachmentId: attachment.id,
      objectKey: attachment.objectKey,
      mime: attachment.mime,
      type: attachment.type,
    };

    // Обрабатываем файл
    const result = await processAttachment(job);

    if (result.success) {
      // Обновляем метаданные в БД
      await updateAttachmentMetadata(attachment.id, result, db);

      // Создаем SystemCard для уведомления
      await createProcessingSystemCard(attachment.id, result, db);

      return NextResponse.json({
        success: true,
        metadata: result.metadata,
        thumbKey: result.thumbKey,
        avClean: result.avClean,
      });
    } else {
      // Создаем SystemCard для ошибки
      await createProcessingSystemCard(attachment.id, result, db);

      return NextResponse.json(
        { 
          error: 'Processing failed',
          details: result.error,
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error processing file:', error);

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
