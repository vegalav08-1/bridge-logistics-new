import { NextRequest, NextResponse } from 'next/server';
import { duplicateRequestSchema } from '@yp/api';
import { duplicateRequest } from '@yp/api';
import { FLAGS } from '@yp/shared';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!FLAGS.REQUEST_OFFER_FLOW_ENABLED) {
    return NextResponse.json({ error: 'Offer flow is disabled' }, { status: 404 });
  }

  try {
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // TODO: Verify access token and get user info
    const payload: any = { sub: 'user-id', role: 'USER' }; // Mock for now

    const validatedData = duplicateRequestSchema.parse({ requestId: params.id });

    const result = await duplicateRequest(validatedData.requestId, payload.sub);

    console.log(`request.duplicate: user=${payload.sub}, requestId=${validatedData.requestId}, newRequestId=${result.newRequestId}`);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error duplicating request:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to duplicate request' }, { status: 500 });
  }
}