import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { verifyAccess } from '@yp/api';
import { generateReferralToken, isTokenUnique } from '@yp/api';
import { FLAGS } from '@yp/shared';

export async function POST(request: NextRequest) {
  try {
    // Проверяем фиче-флаг
    if (!FLAGS.REFERRALS_ENABLED) {
      return NextResponse.json(
        { error: 'Реферальные ссылки отключены' },
        { status: 403 }
      );
    }

    // Проверяем авторизацию
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Токен не найден' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let payload: any;
    try {
      payload = verifyAccess(token);
    } catch {
      return NextResponse.json(
        { error: 'Неверный токен' },
        { status: 401 }
      );
    }

    // Проверяем роль
    if (!['ADMIN', 'SUPER_ADMIN'].includes(payload.role)) {
      return NextResponse.json(
        { error: 'Доступ запрещён' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { label } = body;

    // Генерируем уникальный токен
    let tokenValue: string;
    let attempts = 0;
    do {
      tokenValue = generateReferralToken();
      attempts++;
      if (attempts > 10) {
        return NextResponse.json(
          { error: 'Не удалось сгенерировать уникальный токен' },
          { status: 500 }
        );
      }
    } while (!(await isTokenUnique(tokenValue, prisma)));

    // Создаем реферальную ссылку
    const referralToken = await prisma.referralToken.create({
      data: {
        adminId: payload.sub,
        token: tokenValue,
        label: label || null
      }
    });

    const url = `${process.env.APP_BASE_URL}/r/${tokenValue}`;

    console.log(`referral.create: adminId=${payload.sub}, tokenId=${referralToken.id}`);

    return NextResponse.json({
      id: referralToken.id,
      token: referralToken.token,
      url,
      label: referralToken.label,
      createdAt: referralToken.createdAt
    }, { status: 201 });

  } catch (error) {
    console.error('Create referral error:', error);
    return NextResponse.json(
      { error: 'Ошибка создания реферальной ссылки' },
      { status: 500 }
    );
  }
}





