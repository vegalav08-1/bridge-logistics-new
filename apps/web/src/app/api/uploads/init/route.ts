import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@yp/db';
import { FLAGS } from '@yp/shared';

export async function POST(request: NextRequest) {
  if (!FLAGS.CHUNK_UPLOADS_ENABLED) {
    return NextResponse.json({ error: 'Chunked uploads disabled' }, { status: 404 });
  }

  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { chatId, fileName, mime, bytes } = body;

    if (!chatId || !fileName || !mime || !bytes) {
      return NextResponse.json({ 
        error: 'Missing required fields: chatId, fileName, mime, bytes' 
      }, { status: 400 });
    }

    // Проверяем доступ к чату
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Вычисляем размер части (5-8 МБ)
    const partSize = Math.min(8 * 1024 * 1024, Math.max(5 * 1024 * 1024, Math.floor(bytes / 10)));
    
    // Создаем сессию загрузки
    const uploadSession = await prisma.uploadSession.create({
      data: {
        userId: user.id,
        chatId,
        fileName,
        mime,
        totalSize: bytes,
        partSize,
        status: 'INIT'
      }
    });

    console.log(`Upload session created: ${uploadSession.id} for chat ${chatId} by user ${user.id}`);

    return NextResponse.json({
      uploadId: uploadSession.id,
      partSize,
      totalParts: Math.ceil(bytes / partSize)
    });

  } catch (error: any) {
    console.error('Error creating upload session:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create upload session' 
    }, { status: 500 });
  }
}
