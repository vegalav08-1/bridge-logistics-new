import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { PackingService } from '@yp/api';
import { presetUpdateSchema } from '@yp/api';
import { FLAGS } from '@yp/shared';

export async function PATCH(
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

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = presetUpdateSchema.parse(body);

    const preset = await PackingService.updatePreset(params.id, validatedData, user.id);
    return NextResponse.json({ preset });
  } catch (error) {
    console.error('Error updating preset:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update preset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await PackingService.deletePreset(params.id, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting preset:', error);
    return NextResponse.json(
      { error: 'Failed to delete preset' },
      { status: 500 }
    );
  }
}
