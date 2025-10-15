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

    // Получаем настройки пользователя
    let settings = await db.userSettings.findUnique({
      where: { userId }
    });

    // Если настроек нет, создаем дефолтные
    if (!settings) {
      settings = await db.userSettings.create({
        data: {
          userId,
          pushEnabled: true,
          emailEnabled: true,
          preferredLang: 'ru'
        }
      });
    }

    return NextResponse.json(settings);

  } catch (error: any) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch notification settings' }, { status: 500 });
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
    const { pushEnabled, emailEnabled, quietHoursFrom, quietHoursTo, preferredLang } = body;

    // Валидация
    if (quietHoursFrom !== null && (quietHoursFrom < 0 || quietHoursFrom > 23)) {
      return NextResponse.json({ error: 'quietHoursFrom must be between 0 and 23' }, { status: 400 });
    }

    if (quietHoursTo !== null && (quietHoursTo < 0 || quietHoursTo > 23)) {
      return NextResponse.json({ error: 'quietHoursTo must be between 0 and 23' }, { status: 400 });
    }

    if (preferredLang && !['ru', 'en', 'zh'].includes(preferredLang)) {
      return NextResponse.json({ error: 'preferredLang must be one of: ru, en, zh' }, { status: 400 });
    }

    // Обновляем или создаем настройки
    const settings = await db.userSettings.upsert({
      where: { userId },
      update: {
        pushEnabled: pushEnabled ?? undefined,
        emailEnabled: emailEnabled ?? undefined,
        quietHoursFrom: quietHoursFrom ?? undefined,
        quietHoursTo: quietHoursTo ?? undefined,
        preferredLang: preferredLang ?? undefined
      },
      create: {
        userId,
        pushEnabled: pushEnabled ?? true,
        emailEnabled: emailEnabled ?? true,
        quietHoursFrom,
        quietHoursTo,
        preferredLang: preferredLang ?? 'ru'
      }
    });

    return NextResponse.json(settings);

  } catch (error: any) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json({ error: error.message || 'Failed to update notification settings' }, { status: 500 });
  }
}
