import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@yp/db';
import { verifyAccess } from '@yp/api';
import { receiveShipmentSchema } from '@yp/api';
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
    const userRole = payload.role;

    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Только администраторы могут принимать груз' },
        { status: 403 }
      );
    }

    // Валидация входных данных
    const body = await request.json();
    const validatedData = receiveShipmentSchema.parse(body);

    // Получаем отгрузку с чатом
    const shipment = await prisma.shipment.findUnique({
      where: { id: params.id },
      include: { chat: true }
    });

    if (!shipment) {
      return NextResponse.json(
        { error: 'Отгрузка не найдена' },
        { status: 404 }
      );
    }

    // Проверяем права доступа
    if (shipment.partnerAdminId !== userId) {
      return NextResponse.json(
        { error: 'Нет доступа к этой отгрузке' },
        { status: 403 }
      );
    }

    // Проверяем, что отгрузка в подходящем статусе
    if (shipment.status !== 'NEW') {
      return NextResponse.json(
        { error: 'Груз можно принять только в статусе NEW' },
        { status: 400 }
      );
    }

    // Создаём SystemCard для приёмки
    await prisma.$transaction(async (tx) => {
      // Получаем следующий seq для сообщения
      const lastMessage = await tx.message.findFirst({
        where: { chatId: shipment.chatId },
        orderBy: { seq: 'desc' }
      });
      const nextSeq = (lastMessage?.seq || 0) + 1;

      // Создаём SystemCard
      const systemCardPayload = {
        kind: `receive.${validatedData.mode}`,
        data: {
          notes: validatedData.notes || null
        }
      };

      await tx.message.create({
        data: {
          chatId: shipment.chatId,
          kind: 'system',
          seq: nextSeq,
          payload: JSON.stringify(systemCardPayload),
          createdAt: new Date(),
        }
      });

      // Обновляем время последнего обновления чата
      await tx.chat.update({
        where: { id: shipment.chatId },
        data: { updatedAt: new Date() }
      });

      // В S6 только журналируем, не меняем статус отгрузки
      // В S9 будет state-machine с переходами статусов
    });

    return NextResponse.json(
      {
        message: `Груз принят ${validatedData.mode === 'full' ? 'полностью' : 'частично'}`,
        mode: validatedData.mode,
        notes: validatedData.notes
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Ошибка приёмки груза:', error);
    
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
