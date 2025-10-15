import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { verifyAccess } from '@yp/api';
import { FLAGS } from '@yp/shared';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Проверяем фиче-флаг
    if (!FLAGS.QR_LABELS_ENABLED) {
      return NextResponse.json(
        { error: 'Функциональность QR отключена' },
        { status: 403 }
      );
    }

    // Аутентификация
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }
    
    const payload: any = verifyAccess(accessToken);
    const userId = payload.sub;

    // Получаем QR этикетку
    const qrLabel = await prisma.qRLabel.findUnique({
      where: { id: params.id },
      include: {
        shipment: {
          include: {
            chat: {
              include: {
                members: {
                  include: { user: true }
                }
              }
            }
          }
        }
      }
    });

    if (!qrLabel) {
      return NextResponse.json(
        { error: 'QR этикетка не найдена' },
        { status: 404 }
      );
    }

    // Проверяем права доступа
    const hasAccess = qrLabel.shipment.chat.members.some(
      member => member.userId === userId
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Нет доступа к этой этикетке' },
        { status: 403 }
      );
    }

    // В S6 генерируем простой PDF в памяти
    // В S7 будет интеграция с S3 и полноценная генерация PDF
    const pdfContent = generateSimplePDF(qrLabel.code, qrLabel.shipment.chat.number);

    return new NextResponse(pdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="qr_${qrLabel.code}.pdf"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('Ошибка генерации QR PDF:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// Временная функция для генерации простого PDF
// В S7 будет полноценная генерация с QR кодом
function generateSimplePDF(qrCode: string, chatNumber: string): Buffer {
  // Простой PDF с текстом (в S7 будет настоящий QR код)
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 24 Tf
100 700 Td
(QR Code: ${qrCode}) Tj
0 -50 Td
/F1 16 Tf
(Chat: ${chatNumber}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000525 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
600
%%EOF`;

  return Buffer.from(pdfContent, 'utf-8');
}
