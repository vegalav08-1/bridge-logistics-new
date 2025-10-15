import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { verifyRefresh, signAccess, signRefresh, sha256 } from '@yp/api';
import crypto from 'node:crypto';

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
    try {
      verifyRefresh(refreshToken);
    } catch {
      return NextResponse.json(
        { error: 'Неверный refresh токен' },
        { status: 401 }
      );
    }

    const refreshHash = sha256(refreshToken);

    // Находим сессию
    const session = await prisma.session.findFirst({
      where: {
        refreshHash,
        revokedAt: null,
        validUntil: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Сессия не найдена или истекла' },
        { status: 401 }
      );
    }

    // Создаем новый refresh токен (ротация)
    const newRefreshToken = signRefresh({ 
      sub: session.userId, 
      sid: crypto.randomUUID() 
    });
    const newRefreshHash = sha256(newRefreshToken);

    // Обновляем сессию
    await prisma.$transaction([
      // Отзываем старую сессию
      prisma.session.update({
        where: { id: session.id },
        data: { 
          revokedAt: new Date(),
          reason: 'rotated'
        }
      }),
      // Создаем новую сессию
      prisma.session.create({
        data: {
          userId: session.userId,
          refreshHash: newRefreshHash,
          userAgent: request.headers.get('user-agent') || undefined,
          ip: request.ip || request.headers.get('x-forwarded-for') || undefined,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 дней
        }
      })
    ]);

    // Создаем новый access токен
    const accessToken = signAccess({
      sub: session.userId,
      email: session.user.email,
      role: session.user.role,
      parentAdminId: session.user.parentAdminId,
      sid: session.id
    });

    // Устанавливаем новый cookie
    const response = NextResponse.json({
      accessToken,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        parentAdminId: session.user.parentAdminId
      }
    });

    response.cookies.set('rt', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 дней
    });

    return response;

  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления токена' },
      { status: 500 }
    );
  }
}
