import { NextRequest, NextResponse } from 'next/server';
import { getFeatureFlags } from '@/lib/flags';
import { ChatConfigurator, CargoBox } from '@/lib/chat/configurator';
import { z } from 'zod';

const calcRequestSchema = z.object({
  boxes: z.array(z.object({
    l: z.number().positive(),
    w: z.number().positive(), 
    h: z.number().positive(),
    weight: z.number().positive(),
    qty: z.number().int().positive()
  })).min(1, 'At least one box required'),
  divisor: z.number().positive().optional().default(5000)
});

/**
 * POST /api/configurator/calc - Calculate cargo metrics
 */
export async function POST(request: NextRequest) {
  try {
    const flags = getFeatureFlags();
    
    if (!flags.CHAT_CONFIGURATOR_V1) {
      return NextResponse.json({ error: 'Feature not enabled' }, { status: 403 });
    }

    const body = await request.json();
    const validation = calcRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.error.issues 
      }, { status: 400 });
    }

    const { boxes, divisor } = validation.data;

    try {
      const result = ChatConfigurator.calculate(boxes, divisor);
      
      return NextResponse.json({
        success: true,
        result
      });
    } catch (error) {
      return NextResponse.json({
        error: error instanceof Error ? error.message : 'Calculation failed'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error calculating configurator:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
