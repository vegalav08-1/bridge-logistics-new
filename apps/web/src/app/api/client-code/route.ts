import { NextRequest, NextResponse } from 'next/server';
import { getFeatureFlags } from '@/lib/flags';
import { ClientCodeUtils } from '@/lib/shipment/number-generator';
import { z } from 'zod';

const clientCodeRequestSchema = z.object({
  value: z.string().optional(),
  length: z.number().min(3).max(6).optional().default(4)
});

/**
 * POST /api/client-code/generate - Generate new client code
 */
export async function POST(request: NextRequest) {
  try {
    const flags = getFeatureFlags();
    
    if (!flags.CLIENT_CODE_V1) {
      return NextResponse.json({ error: 'Feature not enabled' }, { status: 403 });
    }

    const body = await request.json();
    const validation = clientCodeRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.error.issues 
      }, { status: 400 });
    }

    const { value, length } = validation.data;

    // If value provided, validate it
    if (value) {
      if (!ClientCodeUtils.isValid(value)) {
        return NextResponse.json({ 
          error: 'Invalid client code format. Must be 3-6 digits.' 
        }, { status: 400 });
      }

      // TODO: Check uniqueness in database
      const isAvailable = true; // Mock for now
      
      return NextResponse.json({
        code: value,
        available: isAvailable
      });
    }

    // Generate new code
    let attempts = 0;
    const maxAttempts = 10;
    let code: string;
    let isAvailable = false;

    do {
      code = ClientCodeUtils.generateRandom(length);
      // TODO: Check uniqueness in database
      isAvailable = true; // Mock for now
      attempts++;
    } while (!isAvailable && attempts < maxAttempts);

    if (!isAvailable) {
      return NextResponse.json({ 
        error: 'Unable to generate unique client code' 
      }, { status: 500 });
    }

    return NextResponse.json({
      code,
      available: true
    });
  } catch (error) {
    console.error('Error generating client code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/client-code/check?value=NNN - Check if client code is available
 */
export async function GET(request: NextRequest) {
  try {
    const flags = getFeatureFlags();
    
    if (!flags.CLIENT_CODE_V1) {
      return NextResponse.json({ error: 'Feature not enabled' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const value = searchParams.get('value');

    if (!value) {
      return NextResponse.json({ 
        error: 'Value parameter is required' 
      }, { status: 400 });
    }

    if (!ClientCodeUtils.isValid(value)) {
      return NextResponse.json({ 
        available: false,
        error: 'Invalid client code format' 
      });
    }

    // TODO: Check uniqueness in database
    const isAvailable = true; // Mock for now

    return NextResponse.json({
      value,
      available: isAvailable
    });
  } catch (error) {
    console.error('Error checking client code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
