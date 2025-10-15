import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@yp/db';
import { verifyAccess } from '@yp/api';
import { acceptOfferSchema } from '@yp/api';
import { generateShipmentQR } from '@yp/shared/qr';
import { FLAGS } from '@yp/shared';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Проверяем фиче-флаги
    if (!FLAGS.REQUEST_OFFER_FLOW_ENABLED || !FLAGS.QR_LABELS_ENABLED) {
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

    if (userRole !== 'USER') {
      return NextResponse.json(
        { error: 'Только пользователи могут принимать офферы' },
        { status: 403 }
      );
    }

    // Валидация
    const validatedData = acceptOfferSchema.parse({ offerId: params.id });

    // Начинаем транзакцию
    const result = await prisma.$transaction(async (tx) => {
      // Получаем оффер с запросом и чатом
      const offer = await tx.offer.findUnique({
        where: { id: validatedData.offerId },
        include: {
          request: {
            include: {
              chat: true,
              createdBy: true
            }
          }
        }
      });

      if (!offer) {
        throw new Error('Оффер не найден');
      }

      // Проверяем, что текущий пользователь - автор запроса
      if (offer.request.createdById !== userId) {
        throw new Error('Нет доступа к этому офферу');
      }

      // Проверяем, что чат в статусе REQUEST
      if (offer.request.chat.status !== 'REQUEST') {
        throw new Error('Оффер уже обработан');
      }

      // Генерируем QR код
      const qrCode = generateShipmentQR(
        offer.request.createdBy.email,
        new Date(),
        1, // seq - временно 1, в S7 сделаем правильную последовательность
        offer.request.boxPcs || 0
      );

      // Создаём отгрузку
      const shipment = await tx.shipment.create({
        data: {
          chatId: offer.request.chatId,
          partnerAdminId: offer.request.partnerAdminId,
          createdById: userId,
          status: 'NEW',
          notes: `Создано из запроса ${offer.request.id}`,
        }
      });

      // Создаём QR этикетку
      const qrLabel = await tx.qRLabel.create({
        data: {
          shipmentId: shipment.id,
          code: qrCode,
          pdfKey: `temp_${shipment.id}.pdf`, // временно, в S7 будет S3
        }
      });

      // Меняем тип чата на SHIPMENT и статус на NEW
      await tx.chat.update({
        where: { id: offer.request.chatId },
        data: {
          type: 'SHIPMENT',
          status: 'NEW',
          updatedAt: new Date(),
        }
      });

      // Получаем следующий seq для сообщений
      const lastMessage = await tx.message.findFirst({
        where: { chatId: offer.request.chatId },
        orderBy: { seq: 'desc' }
      });
      const nextSeq = (lastMessage?.seq || 0) + 1;

      // Создаём SystemCard'ы
      const systemCards = [
        {
          kind: 'offer.accepted',
          data: {}
        },
        {
          kind: 'shipment.created',
          data: { status: 'NEW' }
        },
        {
          kind: 'qr.generated',
          data: {
            code: qrCode,
            pdfUrl: `/api/qr/${qrLabel.id}.pdf` // временно, в S7 будет S3 URL
          }
        }
      ];

      // Вставляем SystemCard'ы
      for (let i = 0; i < systemCards.length; i++) {
        await tx.message.create({
          data: {
            chatId: offer.request.chatId,
            kind: 'system',
            seq: nextSeq + i,
            payload: JSON.stringify(systemCards[i]),
            createdAt: new Date(),
          }
        });
      }

      return {
        shipmentId: shipment.id,
        chatId: offer.request.chatId,
        qrCode,
        qrLabelId: qrLabel.id
      };
    });

    return NextResponse.json(
      {
        shipmentId: result.shipmentId,
        chatId: result.chatId,
        qrCode: result.qrCode,
        message: 'Оффер принят, отгрузка создана'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Ошибка принятия оффера:', error);
    
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

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}