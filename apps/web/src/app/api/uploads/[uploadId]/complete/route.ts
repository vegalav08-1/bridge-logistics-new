import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@yp/db';
import { FLAGS } from '@yp/shared';

export async function POST(
  request: NextRequest,
  { params }: { params: { uploadId: string } }
) {
  if (!FLAGS.CHUNK_UPLOADS_ENABLED) {
    return NextResponse.json({ error: 'Chunked uploads disabled' }, { status: 404 });
  }

  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { uploadId } = params;
    const body = await request.json();
    const { parts } = body;

    if (!parts || !Array.isArray(parts)) {
      return NextResponse.json({ error: 'Missing parts array' }, { status: 400 });
    }

    // Получаем сессию загрузки
    const uploadSession = await prisma.uploadSession.findFirst({
      where: {
        id: uploadId,
        userId: user.id,
        status: 'UPLOADING'
      }
    });

    if (!uploadSession) {
      return NextResponse.json({ error: 'Upload session not found' }, { status: 404 });
    }

    // Проверяем, что все части загружены
    const uploadedParts = await prisma.uploadPart.findMany({
      where: {
        uploadId,
        status: 'UPLOADED'
      },
      orderBy: { partNumber: 'asc' }
    });

    if (uploadedParts.length !== parts.length) {
      return NextResponse.json({ 
        error: 'Not all parts uploaded' 
      }, { status: 400 });
    }

    // Проверяем целостность
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const uploadedPart = uploadedParts[i];
      
      if (part.partNumber !== uploadedPart.partNumber ||
          part.checksum !== uploadedPart.checksum) {
        return NextResponse.json({ 
          error: 'Part integrity check failed' 
        }, { status: 400 });
      }
    }

    // Создаем attachment
    const attachment = await prisma.attachment.create({
      data: {
        userId: user.id,
        chatId: uploadSession.chatId,
        fileName: uploadSession.fileName,
        mime: uploadSession.mime,
        size: uploadSession.totalSize,
        objectKey: `uploads/${uploadId}/${uploadSession.fileName}`,
        status: 'COMPLETED'
      }
    });

    // Создаем сообщение
    const message = await prisma.message.create({
      data: {
        chatId: uploadSession.chatId,
        authorId: user.id,
        kind: 'file',
        seq: await getNextSeq(uploadSession.chatId),
        payload: JSON.stringify({
          attachmentId: attachment.id,
          fileName: attachment.fileName,
          mime: attachment.mime,
          size: attachment.size
        })
      },
      include: {
        author: {
          select: { id: true, email: true, role: true }
        }
      }
    });

    // Обновляем статус сессии
    await prisma.uploadSession.update({
      where: { id: uploadId },
      data: { status: 'COMPLETED' }
    });

    // Очищаем части (в реальном приложении можно оставить для аудита)
    await prisma.uploadPart.deleteMany({
      where: { uploadId }
    });

    console.log(`Upload completed: ${uploadId} -> attachment ${attachment.id}`);

    return NextResponse.json({
      attachmentId: attachment.id,
      messageId: message.id,
      message: {
        id: message.id,
        chatId: message.chatId,
        authorId: message.authorId,
        kind: message.kind,
        seq: message.seq,
        clientId: message.clientId,
        payload: JSON.parse(message.payload),
        createdAt: message.createdAt,
        editedAt: message.editedAt,
        deletedAt: message.deletedAt,
        author: message.author
      }
    });

  } catch (error: any) {
    console.error('Error completing upload:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to complete upload' 
    }, { status: 500 });
  }
}

async function getNextSeq(chatId: string): Promise<number> {
  const lastMessage = await prisma.message.findFirst({
    where: { chatId },
    orderBy: { seq: 'desc' }
  });
  
  return (lastMessage?.seq || 0) + 1;
}







