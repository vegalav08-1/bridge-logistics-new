import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { verifyAccess } from '@yp/api';
import { FLAGS } from '@yp/shared';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Проверяем фиче-флаг
    if (!FLAGS.ADMIN_PARTNERS_ENABLED) {
      return NextResponse.json(
        { error: 'Раздел Партнёры отключён' },
        { status: 403 }
      );
    }

    // Проверяем авторизацию
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Токен не найден' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let payload: any;
    try {
      payload = verifyAccess(token);
    } catch {
      return NextResponse.json(
        { error: 'Неверный токен' },
        { status: 401 }
      );
    }

    // Проверяем роль
    if (!['ADMIN', 'SUPER_ADMIN'].includes(payload.role)) {
      return NextResponse.json(
        { error: 'Доступ запрещён' },
        { status: 403 }
      );
    }

    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    // Проверяем, что пользователь принадлежит текущему админу
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, parentAdminId: true, role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Для обычного админа - проверяем принадлежность к ветке
    if (payload.role === 'ADMIN' && user.parentAdminId !== payload.sub) {
      return NextResponse.json(
        { error: 'Доступ запрещён' },
        { status: 403 }
      );
    }

    // Пагинация
    const skip = cursor ? 1 : 0;
    const cursorObj = cursor ? { id: cursor } : undefined;

    // Получаем чаты пользователя (пока простой список, в S5 будет полноценная лента)
    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: {
            userId: userId
          }
        }
      },
      select: {
        id: true,
        type: true,
        status: true,
        updatedAt: true,
        members: {
          select: {
            user: {
              select: {
                email: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: limit + 1,
      skip,
      cursor: cursorObj
    });

    const hasMore = chats.length > limit;
    const result = hasMore ? chats.slice(0, -1) : chats;
    const nextCursor = hasMore ? result[result.length - 1]?.id : null;

    // Форматируем результат в едином формате карточек
    const feedItems = result.map(chat => ({
      id: chat.id,
      chatId: chat.id,
      number: `CHAT_${chat.id.substring(0, 8)}`, // Временный формат, в S5 будет BRYYYYMMDD_...
      type: chat.type,
      status: chat.status,
      updatedAt: chat.updatedAt,
      preview: `Чат с пользователем`
    }));

    console.log(`partners.user.feed: adminId=${payload.sub}, userId=${userId}, count=${feedItems.length}`);

    return NextResponse.json({
      items: feedItems,
      nextCursor,
      hasMore
    });

  } catch (error) {
    console.error('Get user shipments error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения ленты пользователя' },
      { status: 500 }
    );
  }
}
