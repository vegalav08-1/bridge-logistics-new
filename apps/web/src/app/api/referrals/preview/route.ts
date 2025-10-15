import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
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

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Токен не указан' },
        { status: 400 }
      );
    }

    // Находим реферальную ссылку
    const referralToken = await prisma.referralToken.findUnique({
      where: { token },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!referralToken) {
      return NextResponse.json(
        { error: 'Ссылка не найдена' },
        { status: 404 }
      );
    }

    // Проверяем, что ссылка не отозвана
    if (referralToken.revokedAt) {
      return NextResponse.json(
        { error: 'Ссылка отозвана' },
        { status: 410 }
      );
    }

    // Проверяем, что админ существует и имеет роль ADMIN
    if (referralToken.admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Неверная ссылка' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      adminEmail: referralToken.admin.email,
      label: referralToken.label
    });

  } catch (error) {
    console.error('Preview referral error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения информации о ссылке' },
      { status: 500 }
    );
  }
}





