/**
 * API endpoint для выхода из системы
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Создание ответа
    const response = NextResponse.json({
      success: true,
      message: 'Успешный выход из системы'
    });

    // Очистка cookie с сессией
    response.cookies.set('auth-session', '', {
      expires: new Date(0),
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}