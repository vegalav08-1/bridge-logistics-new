import { NextRequest, NextResponse } from 'next/server';
import { getFeatureFlags } from '@/lib/flags';
import { ChatConfigurator } from '@/lib/chat/configurator';
import { z } from 'zod';

const publishRequestSchema = z.object({
  result: z.object({
    totalVolumeM3: z.number(),
    totalWeightKg: z.number(),
    chargeableWeightKg: z.number(),
    densityKgM3: z.number(),
    lines: z.array(z.any()),
    summary: z.string()
  }),
  note: z.string().optional()
});

/**
 * POST /api/chat/[chatId]/configurator/publish - Publish configurator result to chat
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const flags = getFeatureFlags();
    
    if (!flags.CHAT_CONFIGURATOR_V1) {
      return NextResponse.json({ error: 'Feature not enabled' }, { status: 403 });
    }

    const body = await request.json();
    const validation = publishRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.error.issues 
      }, { status: 400 });
    }

    const { result, note } = validation.data;
    const { chatId } = params;

    // Generate system message payload
    const systemMessage = ChatConfigurator.generateSystemMessage(result, note);

    // TODO: Implement with database
    // 1. Create system message in chat
    // 2. Send notifications to chat participants
    // 3. Log audit event

    console.log('Publishing configurator result to chat:', {
      chatId,
      summary: result.summary,
      note
    });

    return NextResponse.json({
      success: true,
      messageId: 'msg-' + Date.now(),
      message: 'Configurator result published to chat'
    });
  } catch (error) {
    console.error('Error publishing configurator result:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
