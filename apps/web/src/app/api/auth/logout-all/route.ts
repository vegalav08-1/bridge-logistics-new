import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { verifyRefresh } from '@yp/api';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('rt')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh токен не найден' },
        { status: 401 }
      );
    }

    // Верифицируем токен
    let payload: any;
    try {
      payload = verifyRefresh(refreshToken);
    } catch {
      return NextResponse.json(
        { error: 'Неверный refresh токен' },
        { status: 401 }
      );
    }

    // Отзываем все сессии пользователя
    await prisma.session.updateMany({
      where: {
        userId: payload.sub,
        revokedAt: null
      },
      data: {
        revokedAt: new Date(),
        reason: 'logout_all'
      }
    });

    // Очищаем cookie
    const response = NextResponse.json({ message: 'Выход из всех устройств выполнен' });
    response.cookies.delete('rt');

    return response;

  } catch (error) {
    console.error('Logout all error:', error);
    return NextResponse.json(
      { error: 'Ошибка выхода из всех устройств' },
      { status: 500 }
    );
  }
}
