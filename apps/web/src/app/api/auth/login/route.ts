/**
 * API endpoint для входа в систему
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth/session';
import { createAuthSession } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Аутентификация пользователя
    const user = authenticateUser({ email, password });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Создание сессии
    const session = createAuthSession(user.id, user.email, user.role);

    // Создание ответа
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });

    // Установка cookie с сессией
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    
    response.cookies.set('auth-session', session.token, {
      expires,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}