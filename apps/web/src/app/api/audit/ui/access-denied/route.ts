import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[ACL Audit] Access denied:', body);
    // В реальном приложении здесь можно сохранить в базу данных
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[ACL Audit] Error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}


