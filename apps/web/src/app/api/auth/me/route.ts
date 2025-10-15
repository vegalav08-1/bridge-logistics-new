/**
 * API endpoint для получения информации о текущем пользователе
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const session = getServerSession(cookieHeader || undefined);

    if (!session) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.userId,
        email: session.email,
        role: session.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}