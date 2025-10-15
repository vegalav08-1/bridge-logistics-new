import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { registerSchema, hashPassword, sha256 } from '@yp/api';
import { sendMail, verifyEmailTpl } from '@yp/api';
import { FLAGS } from '@yp/shared';
import crypto from 'node:crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, refAdminId, refToken } = registerSchema.parse(body);

    // Проверяем, что пользователь не существует
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Валидируем refAdminId или refToken
    let parentAdminId: string | undefined;
    
    if (refToken && FLAGS.REFERRALS_ENABLED) {
      // Обработка реферального токена
      const referralToken = await prisma.referralToken.findUnique({
        where: { token: refToken },
        include: {
          admin: {
            select: { id: true, role: true }
          }
        }
      });

      if (!referralToken || referralToken.revokedAt) {
        return NextResponse.json(
          { error: 'Неверная реферальная ссылка' },
          { status: 400 }
        );
      }

      if (referralToken.admin.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Неверная реферальная ссылка' },
          { status: 400 }
        );
      }

      parentAdminId = referralToken.adminId;
      console.log(`register.with_ref: newUserId=?, adminId=${referralToken.adminId}, tokenId=${referralToken.id}`);
    } else if (refAdminId) {
      // Обработка прямого refAdminId (старый способ)
      const admin = await prisma.user.findFirst({
        where: { id: refAdminId, role: 'ADMIN' }
      });
      
      if (!admin) {
        return NextResponse.json(
          { error: 'Неверный ID администратора' },
          { status: 400 }
        );
      }
      parentAdminId = refAdminId;
    }

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
        role: 'USER',
        parentAdminId
      }
    });

    // Создаем токен верификации
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = sha256(rawToken);
    
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 минут
      }
    });

    // Отправляем письмо
    const verifyUrl = `${process.env.APP_BASE_URL}/verify?token=${rawToken}`;
    await sendMail({
      to: email,
      subject: 'Подтверждение email',
      html: verifyEmailTpl(verifyUrl)
    });

    return NextResponse.json(
      { message: 'Пользователь создан. Проверьте email для подтверждения.' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Ошибка регистрации' },
      { status: 500 }
    );
  }
}
