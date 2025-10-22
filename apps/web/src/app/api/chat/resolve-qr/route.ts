import { NextRequest, NextResponse } from 'next/server';
import { getFeatureFlags } from '@/lib/flags';
import { QRChatGenerator } from '@/lib/chat/qr-generator';

/**
 * GET /api/chat/resolve-qr?code=BR20251021_7_10(0421) - Resolve QR code to chat access
 */
export async function GET(request: NextRequest) {
  try {
    const flags = getFeatureFlags();
    
    if (!flags.CHAT_QR_ACCESS_V2) {
      return NextResponse.json({ error: 'Feature not enabled' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ 
        error: 'Code parameter is required' 
      }, { status: 400 });
    }

    // Extract shipment number and client code
    const shipmentNumber = QRChatGenerator.parseShipmentNumber(code);
    const clientCode = QRChatGenerator.extractClientCode(code);

    if (!shipmentNumber || !clientCode) {
      return NextResponse.json({
        ok: false,
        reason: 'INVALID_FORMAT',
        error: 'Invalid QR code format'
      });
    }

    // TODO: Implement with database
    // 1. Find shipment by number
    // 2. Get chat ID and branch
    // 3. Check if user's branch matches
    // 4. Return access info

    const mockChatId = 'chat-' + Date.now();
    const mockBranchId = 'branch-1';
    const userBranchId = 'branch-1'; // TODO: Get from user context
    
    const branchOk = mockBranchId === userBranchId;

    if (branchOk) {
      return NextResponse.json({
        ok: true,
        chatId: mockChatId,
        branchOk: true,
        shipmentNumber,
        clientCode
      });
    } else {
      return NextResponse.json({
        ok: false,
        reason: 'FOREIGN_BRANCH',
        chatId: mockChatId,
        branchOk: false,
        shipmentNumber,
        clientCode,
        message: 'Эта отгрузка принадлежит администратору другой ветки'
      });
    }
  } catch (error) {
    console.error('Error resolving QR code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
