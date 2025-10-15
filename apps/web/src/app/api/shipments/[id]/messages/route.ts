import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { canAccessChat } from '@yp/api';
import { FLAGS } from '@yp/shared';
import { verifyAccess } from '@yp/api';
import { createMessageNotification } from '@yp/api';

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
    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') || 50);
    const beforeSeq = searchParams.get('beforeSeq');

    // Получаем сообщения
    const messages = await prisma.message.findMany({
      where: {
        chatId,
        ...(beforeSeq ? { seq: { lt: Number(beforeSeq) } } : {})
      },
      orderBy: { seq: 'asc' },
      take: limit,
      include: {
        author: {
          select: { id: true, email: true, role: true }
        }
      }
    });

    return NextResponse.json({
      messages: messages.map(m => ({
        id: m.id,
        chatId: m.chatId,
        authorId: m.authorId,
        kind: m.kind,
        seq: m.seq,
        clientId: m.clientId,
        payload: JSON.parse(m.payload),
        createdAt: m.createdAt,
        editedAt: m.editedAt,
        deletedAt: m.deletedAt,
        author: m.author
      }))
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch messages' }, { status: 500 });
  }
}

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

    console.log('POST /api/shipments/[id]/messages - Debug info:', {
      userId,
      userRole,
      chatId,
      accessToken: accessToken ? 'present' : 'missing'
    });

    // Проверяем доступ к чату
    const canAccess = await canAccessChat(userId, userRole, chatId);
    console.log('Chat access check result:', canAccess);
    
    // Временно разрешаем доступ для SUPER_ADMIN без проверки членства
    if (!canAccess && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const { kind, payload: messagePayload, clientId } = body;

    if (!kind || !messagePayload) {
      console.log('Missing required fields:', { kind, messagePayload });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Получаем следующий seq для сообщения
    const lastMessage = await prisma.message.findFirst({
      where: { chatId },
      orderBy: { seq: 'desc' }
    });

    const nextSeq = (lastMessage?.seq || 0) + 1;

    // Создаем сообщение
    const message = await prisma.message.create({
      data: {
        chatId,
        authorId: userId,
        kind,
        seq: nextSeq,
        clientId: clientId || null,
        payload: JSON.stringify(messagePayload)
      },
      include: {
        author: {
          select: { id: true, email: true, role: true }
        }
      }
    });

    const responseMessage = {
      id: message.id,
      chatId: message.chatId,
      authorId: message.authorId,
      kind: message.kind,
      seq: message.seq,
      clientId: message.clientId,
      payload: JSON.parse(message.payload),
      createdAt: message.createdAt,
      editedAt: message.editedAt,
      deletedAt: message.deletedAt,
      author: message.author
    };

    // Создаем уведомления для участников чата
    try {
      await createMessageNotification(
        chatId,
        userId,
        message.id,
        kind,
        messagePayload
      );
    } catch (error) {
      console.error('Error creating message notification:', error);
      // Не прерываем основной поток при ошибке создания уведомления
    }

    console.log('New message created:', {
      chatId,
      messageId: message.id,
      authorId: userId,
      seq: message.seq
    });

    return NextResponse.json(responseMessage, { status: 201 });

  } catch (error: any) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: error.message || 'Failed to create message' }, { status: 500 });
  }
}