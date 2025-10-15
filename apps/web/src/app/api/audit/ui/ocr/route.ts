import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // В реальном приложении здесь будет логика сохранения аудита OCR
  // const payload = await req.json();
  // console.log('OCR Audit:', payload);
  return NextResponse.json({ ok: true }, { status: 200 });
}


