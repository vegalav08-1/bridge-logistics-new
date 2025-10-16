import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { verifyAccess } from '@yp/api';
import { FLAGS } from '@yp/shared';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    // Строим фильтр для поиска
    const where: any = {
      role: 'USER'
    };

    // Для обычного админа - только его пользователи
    if (payload.role === 'ADMIN') {
      where.parentAdminId = payload.sub;
    }

    // Поиск по email
    if (q) {
      where.email = {
        contains: q,
        mode: 'insensitive'
      };
    }

    // Пагинация
    const skip = cursor ? 1 : 0;
    const cursorObj = cursor ? { id: cursor } : undefined;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        createdAt: true,
        parentAdminId: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      skip,
      cursor: cursorObj
    });

    const hasMore = users.length > limit;
    const result = hasMore ? users.slice(0, -1) : users;
    const nextCursor = hasMore ? result[result.length - 1]?.id : null;

    console.log(`partners.list: adminId=${payload.sub}, q="${q}", count=${result.length}`);

    return NextResponse.json({
      users: result,
      nextCursor,
      hasMore
    });

  } catch (error) {
    console.error('Get partners users error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения списка пользователей' },
      { status: 500 }
    );
  }
}








