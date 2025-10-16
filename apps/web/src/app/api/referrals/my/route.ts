import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { verifyAccess } from '@yp/api';
import { FLAGS } from '@yp/shared';

export async function GET(request: NextRequest) {
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

    // Получаем реферальные ссылки админа
    const referralTokens = await prisma.referralToken.findMany({
      where: { adminId: payload.sub },
      orderBy: { createdAt: 'desc' }
    });

    const result = referralTokens.map(token => ({
      id: token.id,
      token: token.token,
      label: token.label,
      createdAt: token.createdAt,
      revokedAt: token.revokedAt,
      url: `${process.env.APP_BASE_URL}/r/${token.token}`
    }));

    console.log(`referral.list: adminId=${payload.sub}, count=${result.length}`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Get referrals error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения реферальных ссылок' },
      { status: 500 }
    );
  }
}








