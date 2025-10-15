import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { tokenSchema, sha256 } from '@yp/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = tokenSchema.parse(body);

    const tokenHash = sha256(token);

    // Находим верификацию
    const verification = await prisma.emailVerification.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Неверный токен' },
        { status: 400 }
      );
    }

    // Проверяем срок действия
    if (verification.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Токен истёк' },
        { status: 400 }
      );
    }

    // Проверяем, что не использован
    if (verification.usedAt) {
      return NextResponse.json(
        { error: 'Токен уже использован' },
        { status: 400 }
      );
    }

    // Обновляем пользователя и помечаем токен как использованный
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: new Date() }
      }),
      prisma.emailVerification.update({
        where: { id: verification.id },
        data: { usedAt: new Date() }
      })
    ]);

    return NextResponse.json(
      { message: 'Email подтверждён' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Ошибка подтверждения email' },
      { status: 500 }
    );
  }
}





