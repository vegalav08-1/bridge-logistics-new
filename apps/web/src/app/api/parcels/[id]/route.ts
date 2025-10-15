import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { PackingService } from '../../../../../packages/api/src/packing/service';
import { parcelCreateSchema, parcelsBulkCreateSchema } from '../../../../../packages/api/src/packing/validators';
import { FLAGS } from '@yp/shared';

export async function GET(
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

    const parcels = await PackingService.getParcelsTree(params.id, user.id);
    return NextResponse.json({ parcels });
  } catch (error) {
    console.error('Error fetching parcels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parcels' },
      { status: 500 }
    );
  }
}

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
    
    // Проверяем, это bulk создание или одиночное
    if (body.parcels && Array.isArray(body.parcels)) {
      // Bulk создание
      const validatedData = parcelsBulkCreateSchema.parse(body);
      
      const results = [];
      for (const parcelData of validatedData.parcels) {
        // Генерируем код, если не указан
        if (!parcelData.code) {
          parcelData.code = await PackingService.generateParcelCode(params.id);
        }
        
        const parcel = await PackingService.createParcel({
          ...parcelData,
          chatId: params.id,
          createdById: user.id
        });
        results.push(parcel);
      }
      
      return NextResponse.json({ parcels: results }, { status: 201 });
    } else {
      // Одиночное создание
      const validatedData = parcelCreateSchema.parse(body);
      
      // Генерируем код, если не указан
      if (!validatedData.code) {
        validatedData.code = await PackingService.generateParcelCode(params.id);
      }
      
      const parcel = await PackingService.createParcel({
        ...validatedData,
        chatId: params.id,
        createdById: user.id
      });
      
      return NextResponse.json({ parcel }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating parcel(s):', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create parcel(s)' },
      { status: 500 }
    );
  }
}
