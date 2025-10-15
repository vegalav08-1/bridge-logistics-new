import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { emailSchema, sendMail, resetPasswordTpl, sha256 } from '@yp/api';
import crypto from 'node:crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = emailSchema.parse(body.email);

    // Всегда возвращаем 200 для безопасности (не утечка информации)
    const response = NextResponse.json({ 
      message: 'Если пользователь с таким email существует, письмо отправлено' 
    });

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return response; // Не раскрываем, что пользователь не существует
    }

    // Создаем токен сброса пароля
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = sha256(rawToken);
    
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 минут
      }
    });

    // Отправляем письмо
    const resetUrl = `${process.env.APP_BASE_URL}/reset?token=${rawToken}`;
    await sendMail({
      to: email,
      subject: 'Сброс пароля',
      html: resetPasswordTpl(resetUrl)
    });

    return response;

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Ошибка отправки письма' },
      { status: 500 }
    );
  }
}
