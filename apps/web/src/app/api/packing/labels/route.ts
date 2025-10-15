import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { LabelGenerator } from '../../../../../packages/api/src/packing/labels';
import { labelsGenerateSchema } from '../../../../../packages/api/src/packing/validators';
import { FLAGS } from '@yp/shared';

export async function POST(request: NextRequest) {
  try {
    if (!FLAGS.PACK_LABELS_ENABLED) {
      return NextResponse.json({ error: 'Labels feature disabled' }, { status: 403 });
    }

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Только админы могут генерировать этикетки
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = labelsGenerateSchema.parse(body);

    const labelUrls = await LabelGenerator.generateLabels(validatedData.parcelIds);
    
    return NextResponse.json({ 
      success: true,
      labelUrls,
      count: labelUrls.length
    });
  } catch (error) {
    console.error('Error generating labels:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate labels' },
      { status: 500 }
    );
  }
}
