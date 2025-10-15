import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { PackingService } from '../../../../../packages/api/src/packing/service';
import { parcelMoveSchema } from '../../../../../packages/api/src/packing/validators';
import { FLAGS } from '@yp/shared';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!FLAGS.PACK_PRO_ENABLED) {
      return NextResponse.json({ error: 'Feature disabled' }, { status: 403 });
    }

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = parcelMoveSchema.parse(body);

    const parcel = await PackingService.moveParcel(params.id, validatedData, user.id);
    return NextResponse.json({ parcel });
  } catch (error) {
    console.error('Error moving parcel:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to move parcel' },
      { status: 500 }
    );
  }
}
