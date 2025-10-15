import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@yp/db';
import { FLAGS } from '@yp/shared';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Получаем вложение с метаданными
    const attachment = await prisma.attachment.findFirst({
      where: {
        id,
        chat: {
          members: { some: { userId: user.id } }
        }
      },
      include: {
        meta: true,
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        annotations: {
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        chat: {
          select: { id: true, number: true, type: true }
        }
      }
    });

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    // Проверяем безопасность файла
    if (!attachment.isSafe && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ 
        error: 'File is not safe',
        isUnsafe: true 
      }, { status: 403 });
    }

    return NextResponse.json({
      id: attachment.id,
      chatId: attachment.chatId,
      messageId: attachment.messageId,
      fileName: attachment.fileName,
      type: attachment.type,
      mime: attachment.mime,
      bytes: attachment.bytes,
      width: attachment.width,
      height: attachment.height,
      pages: attachment.pages,
      thumbKey: attachment.thumbKey,
      ocrTextKey: attachment.ocrTextKey,
      isSafe: attachment.isSafe,
      currentVerId: attachment.currentVerId,
      uploadedAt: attachment.uploadedAt,
      updatedAt: attachment.updatedAt,
      chat: attachment.chat,
      meta: attachment.meta,
      versions: attachment.versions.map(v => ({
        id: v.id,
        fileName: v.fileName,
        mime: v.mime,
        bytes: v.bytes,
        createdAt: v.createdAt,
        note: v.note
      })),
      annotations: attachment.annotations.map(a => ({
        id: a.id,
        authorId: a.authorId,
        page: a.page,
        rect: a.rect ? JSON.parse(a.rect) : null,
        content: a.content,
        createdAt: a.createdAt
      }))
    });

  } catch (error: any) {
    console.error('Error fetching attachment:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch attachment' 
    }, { status: 500 });
  }
}
