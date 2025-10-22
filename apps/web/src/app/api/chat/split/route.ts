import { NextRequest, NextResponse } from 'next/server';
import { getFeatureFlags } from '@/lib/flags';
import { z } from 'zod';

const splitRequestSchema = z.object({
  childChatId: z.string().uuid()
});

/**
 * POST /api/chat/split - Remove child from master chat
 */
export async function POST(request: NextRequest) {
  try {
    const flags = getFeatureFlags();
    
    if (!flags.CHAT_MERGE_SPLIT_V2) {
      return NextResponse.json({ error: 'Feature not enabled' }, { status: 403 });
    }

    const body = await request.json();
    const validation = splitRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.error.issues 
      }, { status: 400 });
    }

    const { childChatId } = validation.data;

    // TODO: Implement with database
    // 1. Remove from chat_link
    // 2. Create system message in child
    // 3. Create system message in master
    
    console.log('Splitting child chat:', childChatId);

    return NextResponse.json({
      success: true,
      message: 'Child chat removed from master'
    });
  } catch (error) {
    console.error('Error splitting chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
