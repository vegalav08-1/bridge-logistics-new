import { NextRequest, NextResponse } from 'next/server';
import { db } from '@yp/db';
import { verifyAccess } from '@yp/api';
import { FLAGS } from '@yp/shared';

export async function GET(request: NextRequest) {
  try {
    // Проверяем фиче-флаг
    if (!FLAGS.NOTIFICATIONS_V2_ENABLED) {
      return NextResponse.json({ error: 'Notifications feature is disabled' }, { status: 404 });
    }

    // Аутентификация
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: any = verifyAccess(accessToken);
    const userId = payload.sub;

    // Параметры запроса с валидацией
    const { searchParams } = new URL(request.url);
    
    // Валидация page
    const pageParam = searchParams.get('page') || '1';
    const page = Math.max(1, parseInt(pageParam));
    if (isNaN(page)) {
      return NextResponse.json({ error: 'Invalid page parameter' }, { status: 400 });
    }
    
    // Валидация limit
    const limitParam = searchParams.get('limit') || '20';
    const limit = Math.min(Math.max(1, parseInt(limitParam)), 100);
    if (isNaN(limit)) {
      return NextResponse.json({ error: 'Invalid limit parameter' }, { status: 400 });
    }
    
    const type = searchParams.get('type');
    const isRead = searchParams.get('isRead');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Строим фильтры
    const where: any = { userId };

    if (type) {
      where.type = type;
    }

    if (isRead !== null && isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { body: { contains: search } }
      ];
    }

    // Получаем уведомления
    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, email: true, role: true }
          }
        }
      }),
      db.notification.count({ where })
    ]);

    // Получаем статистику
    const unreadCount = await db.notification.count({
      where: { userId, isRead: false }
    });

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        unreadCount,
        totalCount: total
      }
    });

  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Проверяем фиче-флаг
    if (!FLAGS.NOTIFICATIONS_V2_ENABLED) {
      return NextResponse.json({ error: 'Notifications feature is disabled' }, { status: 404 });
    }

    // Аутентификация
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: any = verifyAccess(accessToken);
    const userId = payload.sub;

    const body = await request.json();
    const { type, title, body: notificationBody, data, chatId, messageId } = body;

    if (!type || !title) {
      return NextResponse.json({ error: 'Type and title are required' }, { status: 400 });
    }

    // Создаем уведомление
    const notification = await db.notification.create({
      data: {
        userId,
        type,
        title,
        body: notificationBody,
        data: data ? JSON.stringify(data) : null,
        chatId,
        messageId
      },
      include: {
        user: {
          select: { id: true, email: true, role: true }
        }
      }
    });

    return NextResponse.json(notification, { status: 201 });

  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: error.message || 'Failed to create notification' }, { status: 500 });
  }
}
