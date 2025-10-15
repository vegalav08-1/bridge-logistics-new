import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@yp/db';
import { verifyAccess } from '@yp/api';
import { createOfferSchema } from '@yp/api';
import { FLAGS } from '@yp/shared';

export async function POST(request: NextRequest) {
  try {
    // Проверяем фиче-флаг
    if (!FLAGS.REQUEST_OFFER_FLOW_ENABLED) {
      return NextResponse.json(
        { error: 'Функциональность офферов отключена' },
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
        { error: 'Только администраторы могут создавать офферы' },
        { status: 403 }
      );
    }

    // Валидация входных данных
    const body = await request.json();
    const validatedData = createOfferSchema.parse(body);

    // Проверяем, что запрос существует и принадлежит этому админу
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

    if (requestRecord.partnerAdminId !== userId) {
      return NextResponse.json(
        { error: 'Нет доступа к этому запросу' },
        { status: 403 }
      );
    }

    // Проверяем, что чат в статусе REQUEST
    if (requestRecord.chat.status !== 'REQUEST') {
      return NextResponse.json(
        { error: 'Оффер можно создать только для активного запроса' },
        { status: 400 }
      );
    }

    // Создаём или обновляем оффер (политика one-latest)
    const offer = await prisma.offer.upsert({
      where: { requestId: validatedData.requestId },
      create: {
        requestId: validatedData.requestId,
        partnerAdminId: userId,
        pricePerKgUSD: validatedData.pricePerKgUSD,
        insuranceUSD: validatedData.insuranceUSD,
        packingUSD: validatedData.packingUSD,
        deliveryDays: validatedData.deliveryDays,
        deliveryMethod: validatedData.deliveryMethod,
        notes: validatedData.notes,
      },
      update: {
        pricePerKgUSD: validatedData.pricePerKgUSD,
        insuranceUSD: validatedData.insuranceUSD,
        packingUSD: validatedData.packingUSD,
        deliveryDays: validatedData.deliveryDays,
        deliveryMethod: validatedData.deliveryMethod,
        notes: validatedData.notes,
        updatedAt: new Date(),
      },
    });

    // Создаём SystemCard для чата
    const systemCardPayload = {
      kind: 'offer.proposed',
      data: {
        pricePerKgUSD: offer.pricePerKgUSD,
        insuranceUSD: offer.insuranceUSD,
        packingUSD: offer.packingUSD,
        deliveryDays: offer.deliveryDays,
        deliveryMethod: offer.deliveryMethod,
        notes: offer.notes,
      }
    };

    // Получаем следующий seq для сообщения
    const lastMessage = await prisma.message.findFirst({
      where: { chatId: requestRecord.chatId },
      orderBy: { seq: 'desc' }
    });
    const nextSeq = (lastMessage?.seq || 0) + 1;

    // Создаём SystemCard сообщение
    await prisma.message.create({
      data: {
        chatId: requestRecord.chatId,
        kind: 'system',
        seq: nextSeq,
        payload: JSON.stringify(systemCardPayload),
        createdAt: new Date(),
      }
    });

    // Обновляем время последнего обновления чата
    await prisma.chat.update({
      where: { id: requestRecord.chatId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json(
      { 
        id: offer.id, 
        requestId: offer.requestId,
        message: 'Оффер создан успешно'
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Ошибка создания оффера:', error);
    
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