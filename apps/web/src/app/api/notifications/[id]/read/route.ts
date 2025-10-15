import { NextRequest, NextResponse } from 'next/server';
import { db } from '@yp/db';
import { verifyAccess } from '@yp/api';
import { FLAGS } from '@yp/shared';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Отмечаем как прочитанное
    const updatedNotification = await db.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date()
      },
      include: {
        user: {
          select: { id: true, email: true, role: true }
        }
      }
    });

    return NextResponse.json(updatedNotification);

  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: error.message || 'Failed to mark notification as read' }, { status: 500 });
  }
}
