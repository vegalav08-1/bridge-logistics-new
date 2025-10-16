import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { canAccessChat } from '@yp/api';
import { FLAGS } from '@yp/shared';
import { verifyAccess } from '@yp/api';

export async function GET(request: NextRequest) {
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

    // Получаем все чаты, где пользователь является участником (оптимизированный запрос)
    const userChats = await prisma.chatMember.findMany({
      where: { userId },
      select: {
        chat: {
          select: {
            id: true,
            number: true,
            type: true,
            status: true,
            updatedAt: true,
            members: {
              select: {
                userId: true,
                role: true,
                user: {
                  select: { id: true, email: true, role: true }
                }
              }
            },
            messages: {
              orderBy: { seq: 'desc' },
              take: 1,
              select: {
                id: true,
                kind: true,
                payload: true,
                createdAt: true,
                author: {
                  select: { id: true, email: true, role: true }
                }
              }
            }
          }
        }
      },
      orderBy: {
        chat: {
          updatedAt: 'desc'
        }
      }
    });

    // Для SUPER_ADMIN получаем все чаты
    let allChats = userChats;
    if (userRole === 'SUPER_ADMIN') {
      const superAdminChats = await prisma.chat.findMany({
        include: {
          members: {
            include: {
              user: {
                select: { id: true, email: true, role: true }
              }
            }
          },
          messages: {
            orderBy: { seq: 'desc' },
            take: 1,
            include: {
              author: {
                select: { id: true, email: true, role: true }
              }
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });

      allChats = superAdminChats.map(chat => ({
        chatId: chat.id,
        userId: userId,
        role: 'ADMIN', // SUPER_ADMIN имеет права админа во всех чатах
        joinedAt: chat.createdAt,
        chat
      }));
    }

    // Получаем информацию о прочитанных сообщениях для каждого чата
    const shipmentsWithUnread = await Promise.all(
      allChats.map(async (userChat) => {
        const chat = userChat.chat;
        
        // TODO: Получаем информацию о прочитанных сообщениях
        // Пока что используем raw query
        let chatRead: any = null;
        try {
          const result = await prisma.$queryRaw`
            SELECT * FROM ChatRead WHERE chatId = ${chat.id} AND userId = ${userId}
          `;
          chatRead = Array.isArray(result) ? result[0] : result;
        } catch (error) {
          console.error('Error fetching read status:', error);
        }

        // Получаем последнее сообщение
        const lastMessage = chat.messages[0];
        const lastReadSeq = chatRead?.maxSeq || 0;
        const unreadCount = lastMessage ? Math.max(0, lastMessage.seq - lastReadSeq) : 0;

        return {
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
          })),
          lastMessage: lastMessage ? {
            id: lastMessage.id,
            chatId: lastMessage.chatId,
            authorId: lastMessage.authorId,
            kind: lastMessage.kind,
            seq: lastMessage.seq,
            clientId: lastMessage.clientId,
            payload: JSON.parse(lastMessage.payload),
            createdAt: lastMessage.createdAt,
            editedAt: lastMessage.editedAt,
            deletedAt: lastMessage.deletedAt,
            author: lastMessage.author
          } : null,
          unreadCount,
          hasUnread: unreadCount > 0,
          lastReadSeq
        };
      })
    );

    return NextResponse.json({ items: shipmentsWithUnread }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching shipments:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch shipments' }, { status: 500 });
  }
}
