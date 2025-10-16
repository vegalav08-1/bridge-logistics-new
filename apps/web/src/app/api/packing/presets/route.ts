import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { PackingService } from '@yp/api';
import { presetCreateSchema } from '@yp/api';
import { FLAGS } from '@yp/shared';

export async function GET(request: NextRequest) {
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

    const presets = await PackingService.getPresets(user.id);
    return NextResponse.json({ presets });
  } catch (error) {
    console.error('Error fetching presets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch presets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const validatedData = presetCreateSchema.parse(body);

    const preset = await PackingService.createPreset({
      ...validatedData,
      adminId: user.id
    });

    return NextResponse.json({ preset }, { status: 201 });
  } catch (error) {
    console.error('Error creating preset:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create preset' },
      { status: 500 }
    );
  }
}
