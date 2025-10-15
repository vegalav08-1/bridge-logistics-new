import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { canAccessChat } from '@yp/api';
import { FLAGS } from '@yp/shared';
import { verifyAccess } from '@yp/api';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!FLAGS.CHAT_SUMMARY_ON_CREATE) {
    return NextResponse.json({ error: 'Chat feature is disabled' }, { status: 404 });
  }

  try {
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload: any = verifyAccess(accessToken);
    const userId = payload.sub;
    const userRole = payload.role;

    const chatId = params.id;

    // Проверяем доступ к чату
    const canAccess = await canAccessChat(userId, userRole, chatId);
    if (!canAccess && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { lastReadSeq } = body;

    if (typeof lastReadSeq !== 'number') {
      return NextResponse.json({ error: 'Invalid lastReadSeq' }, { status: 400 });
    }

    // TODO: Обновляем или создаем запись о прочитанных сообщениях
    // Пока что просто логируем
    console.log('Marking chat as read:', { chatId, userId, lastReadSeq });
    
    // Обновляем или создаем запись о прочитанных сообщениях
    try {
      await prisma.chatRead.upsert({
        where: {
          chatId_userId: {
            chatId: chatId,
            userId: userId,
          },
        },
        update: {
          maxSeq: lastReadSeq,
        },
        create: {
          chatId: chatId,
          userId: userId,
          maxSeq: lastReadSeq,
        },
      });
    } catch (error) {
      console.error('Error updating read status:', error);
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating read status:', error);
    return NextResponse.json({ error: error.message || 'Failed to update read status' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!FLAGS.CHAT_SUMMARY_ON_CREATE) {
    return NextResponse.json({ error: 'Chat feature is disabled' }, { status: 404 });
  }

  try {
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload: any = verifyAccess(accessToken);
    const userId = payload.sub;
    const userRole = payload.role;

    const chatId = params.id;

    // Проверяем доступ к чату
    const canAccess = await canAccessChat(userId, userRole, chatId);
    if (!canAccess && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Получаем информацию о прочитанных сообщениях
    const chatRead = await prisma.chatRead.findUnique({
      where: {
        chatId_userId: {
          chatId: chatId,
          userId: userId,
        },
      },
    });

    // Получаем общее количество сообщений в чате
    const totalMessages = await prisma.message.count({
      where: { chatId }
    });

    // Получаем последнее сообщение
    const lastMessage = await prisma.message.findFirst({
      where: { chatId },
      orderBy: { seq: 'desc' }
    });

    const lastReadSeq = chatRead?.maxSeq || 0;
    const unreadCount = lastMessage ? Math.max(0, lastMessage.seq - lastReadSeq) : 0;

    return NextResponse.json({
      lastReadSeq,
      unreadCount,
      totalMessages,
      hasUnread: unreadCount > 0
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching read status:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch read status' }, { status: 500 });
  }
}
