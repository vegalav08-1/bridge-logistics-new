import { NextRequest, NextResponse } from 'next/server';
import { db } from '@yp/db';
import { verifyAccess } from '@yp/api';
import { FLAGS } from '@yp/shared';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const notificationId = params.id;

    // Получаем уведомление
    const notification = await db.notification.findFirst({
      where: {
        id: notificationId,
        userId // Проверяем, что уведомление принадлежит пользователю
      },
      include: {
        user: {
          select: { id: true, email: true, role: true }
        }
      }
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json(notification);

  } catch (error: any) {
    console.error('Error fetching notification:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch notification' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const notificationId = params.id;

    // Проверяем, что уведомление принадлежит пользователю
    const notification = await db.notification.findFirst({
      where: {
        id: notificationId,
        userId
      }
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Удаляем уведомление
    await db.notification.delete({
      where: { id: notificationId }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete notification' }, { status: 500 });
  }
}
