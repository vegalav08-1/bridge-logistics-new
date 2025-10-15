import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // В реальном приложении здесь будет логика сохранения аудита финансов
  // const payload = await req.json();
  // console.log('Finance Audit:', payload);
  return NextResponse.json({ ok: true }, { status: 200 });
}


