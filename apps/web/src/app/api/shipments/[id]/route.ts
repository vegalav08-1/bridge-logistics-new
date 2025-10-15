import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { canAccessChat } from '@yp/api';
import { FLAGS } from '@yp/shared';
import { verifyAccess } from '@yp/api';

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

    // Получаем чат с участниками
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, role: true }
            }
          }
        }
      }
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: chat.id,
      number: chat.number,
      type: chat.type,
      status: chat.status,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      members: chat.members.map(m => ({
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
        user: m.user
      }))
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching chat:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch chat' }, { status: 500 });
  }
}



