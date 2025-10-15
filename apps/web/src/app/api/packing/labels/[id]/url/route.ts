import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPresignedGet } from '@yp/files/s3';
import { FLAGS } from '@yp/shared';
import { db } from '@yp/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!FLAGS.PACK_LABELS_ENABLED) {
      return NextResponse.json({ error: 'Labels feature disabled' }, { status: 403 });
    }

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем Parcel и проверяем доступ
    const parcel = await db.parcel.findFirst({
      where: {
        id: params.id,
        chat: {
          members: {
            some: {
              userId: user.id
            }
          }
        }
      },
      select: { labelKey: true }
    });

    if (!parcel) {
      return NextResponse.json({ error: 'Parcel not found or access denied' }, { status: 404 });
    }

    if (!parcel.labelKey) {
      return NextResponse.json({ error: 'Label not generated' }, { status: 404 });
    }

    // Генерируем presigned URL для скачивания этикетки
    const labelUrl = await getPresignedGet(parcel.labelKey);
    
    return NextResponse.json({ labelUrl });
  } catch (error) {
    console.error('Error getting label URL:', error);
    return NextResponse.json(
      { error: 'Failed to get label URL' },
      { status: 500 }
    );
  }
}
