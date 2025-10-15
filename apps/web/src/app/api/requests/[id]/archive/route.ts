import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@yp/db';
import { verifyAccess } from '@yp/api';
import { archiveRequestSchema } from '@yp/api';
import { FLAGS } from '@yp/shared';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Проверяем фиче-флаг
    if (!FLAGS.REQUEST_OFFER_FLOW_ENABLED) {
      return NextResponse.json(
        { error: 'Функциональность отключена' },
        { status: 403 }
      );
    }

    // Аутентификация
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }
    
    const payload: any = verifyAccess(accessToken);
    const userId = payload.sub;

    // Валидация
    const validatedData = archiveRequestSchema.parse({ requestId: params.id });

    // Получаем запрос с чатом
    const requestRecord = await prisma.request.findUnique({
      where: { id: validatedData.requestId },
      include: { chat: true }
    });

    if (!requestRecord) {
      return NextResponse.json(
        { error: 'Запрос не найден' },
        { status: 404 }
      );
    }

    // Проверяем права доступа
    if (requestRecord.createdById !== userId) {
      return NextResponse.json(
        { error: 'Нет доступа к этому запросу' },
        { status: 403 }
      );
    }

    // Проверяем, что запрос можно архивировать
    if (requestRecord.chat.status === 'ARCHIVED') {
      return NextResponse.json(
        { error: 'Запрос уже архивирован' },
        { status: 400 }
      );
    }

    if (requestRecord.chat.type !== 'REQUEST') {
      return NextResponse.json(
        { error: 'Можно архивировать только запросы' },
        { status: 400 }
      );
    }

    // Архивируем запрос
    await prisma.$transaction(async (tx) => {
      // Меняем статус чата на ARCHIVED
      await tx.chat.update({
        where: { id: requestRecord.chatId },
        data: {
          status: 'ARCHIVED',
          updatedAt: new Date(),
        }
      });

      // Получаем следующий seq для сообщения
      const lastMessage = await tx.message.findFirst({
        where: { chatId: requestRecord.chatId },
        orderBy: { seq: 'desc' }
      });
      const nextSeq = (lastMessage?.seq || 0) + 1;

      // Создаём SystemCard
      const systemCardPayload = {
        kind: 'request.archived',
        data: {}
      };

      await tx.message.create({
        data: {
          chatId: requestRecord.chatId,
          kind: 'system',
          seq: nextSeq,
          payload: JSON.stringify(systemCardPayload),
          createdAt: new Date(),
        }
      });
    });

    return NextResponse.json(
      { 
        message: 'Запрос архивирован',
        chatId: requestRecord.chatId
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Ошибка архивации запроса:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Ошибка валидации',
          details: error.errors.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
