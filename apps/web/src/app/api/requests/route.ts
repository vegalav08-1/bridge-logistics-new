import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { createRequestSchema } from '@yp/api';
import { createChatWithSummary } from '@yp/api';
import { canCreateForAdmin } from '@yp/api';
import { FLAGS } from '@yp/shared';
import { verifyAccess } from '@yp/api';

export async function POST(request: NextRequest) {
  if (!FLAGS.CHAT_SUMMARY_ON_CREATE) {
    return NextResponse.json({ error: 'Chat creation feature is disabled' }, { status: 404 });
  }

  try {
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload: any = verifyAccess(accessToken);
    const userId = payload.sub;
    const userRole = payload.role;

    if (userRole !== 'USER' && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const requestData = createRequestSchema.parse(body);

    // Определяем adminId
    let adminId: string;
    if (userRole === 'USER') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { parentAdminId: true }
      });
      
      if (!user?.parentAdminId) {
        return NextResponse.json(
          { error: 'User must have a parent admin to create requests' },
          { status: 400 }
        );
      }
      adminId = user.parentAdminId;
    } else {
      // ADMIN или SUPER_ADMIN создают для себя
      adminId = userId;
    }

    // Проверяем права
    const canCreate = await canCreateForAdmin(userId, userRole, adminId);
    if (!canCreate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Создаем чат с резюме и запрос в транзакции
    const result = await prisma.$transaction(async (tx) => {
      const summary = {
        kind: 'summary' as const,
        entity: 'request' as const,
        data: requestData
      };

      const chat = await createChatWithSummary({
        entity: 'request',
        authorUserId: userId,
        adminId,
        summary,
        status: 'REQUEST',
        tx,
        prismaClient: prisma
      });

      const request = await tx.request.create({
        data: {
          chatId: chat.id,
          partnerAdminId: adminId,
          createdById: userId,
          ...requestData
        }
      });

      return { chat, request };
    });

    console.log(`request.create: requestId=${result.request.id}, chatId=${result.chat.id}, userId=${userId}, adminId=${adminId}`);

    return NextResponse.json({
      id: result.request.id,
      chatId: result.chat.id,
      chatNumber: result.chat.number,
      status: 'REQUEST'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating request:', error);
    return NextResponse.json({ error: error.message || 'Failed to create request' }, { status: 500 });
  }
}

