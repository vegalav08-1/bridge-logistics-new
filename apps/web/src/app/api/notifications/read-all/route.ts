import { NextRequest, NextResponse } from 'next/server';
import { db } from '@yp/db';
import { verifyAccess } from '@yp/api';
import { FLAGS } from '@yp/shared';

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

    // Отмечаем все уведомления как прочитанные
    const result = await db.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count
    });

  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json({ error: error.message || 'Failed to mark all notifications as read' }, { status: 500 });
  }
}
