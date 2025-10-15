import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { resetSchema, hashPassword, sha256 } from '@yp/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = resetSchema.parse(body);

    const tokenHash = sha256(token);

    // Находим токен сброса
    const reset = await prisma.passwordReset.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!reset) {
      return NextResponse.json(
        { error: 'Неверный токен' },
        { status: 400 }
      );
    }

    // Проверяем срок действия
    if (reset.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Токен истёк' },
        { status: 400 }
      );
    }

    // Проверяем, что не использован
    if (reset.usedAt) {
      return NextResponse.json(
        { error: 'Токен уже использован' },
        { status: 400 }
      );
    }

    // Обновляем пароль и инвалидируем все сессии
    await prisma.$transaction([
      // Меняем пароль
      prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash: await hashPassword(newPassword) }
      }),
      // Помечаем токен как использованный
      prisma.passwordReset.update({
        where: { id: reset.id },
        data: { usedAt: new Date() }
      }),
      // Отзываем все сессии пользователя
      prisma.session.updateMany({
        where: {
          userId: reset.userId,
          revokedAt: null
        },
        data: {
          revokedAt: new Date(),
          reason: 'password_reset'
        }
      })
    ]);

    return NextResponse.json(
      { message: 'Пароль изменён. Войдите заново.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Ошибка сброса пароля' },
      { status: 500 }
    );
  }
}





