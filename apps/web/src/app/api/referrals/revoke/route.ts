import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { verifyAccess } from '@yp/api';
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
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID ссылки не указан' },
        { status: 400 }
      );
    }

    // Проверяем, что ссылка принадлежит текущему админу
    const referralToken = await prisma.referralToken.findFirst({
      where: {
        id,
        adminId: payload.sub,
        revokedAt: null
      }
    });

    if (!referralToken) {
      return NextResponse.json(
        { error: 'Ссылка не найдена или уже отозвана' },
        { status: 404 }
      );
    }

    // Отзываем ссылку
    await prisma.referralToken.update({
      where: { id },
      data: { revokedAt: new Date() }
    });

    console.log(`referral.revoke: adminId=${payload.sub}, tokenId=${id}`);

    return NextResponse.json({ message: 'Ссылка отозвана' });

  } catch (error) {
    console.error('Revoke referral error:', error);
    return NextResponse.json(
      { error: 'Ошибка отзыва ссылки' },
      { status: 500 }
    );
  }
}





