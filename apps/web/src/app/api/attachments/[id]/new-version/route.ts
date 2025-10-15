import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@yp/db';
import { FLAGS } from '@yp/shared';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!FLAGS.FILES_VERSIONING_ENABLED) {
    return NextResponse.json({ error: 'File versioning disabled' }, { status: 404 });
  }

  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { fileName, mime, bytes, objectKey, sha256, note } = body;

    if (!fileName || !mime || !bytes || !objectKey) {
      return NextResponse.json({ 
        error: 'Missing required fields: fileName, mime, bytes, objectKey' 
      }, { status: 400 });
    }

    // Получаем вложение
    const attachment = await prisma.attachment.findFirst({
      where: {
        id,
        chat: {
          OR: [
            { userId: user.id },
            { partnerAdminId: user.id },
            { members: { some: { userId: user.id } } }
          ]
        }
      }
    });

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    // Проверяем права на создание версии
    const canCreateVersion = user.role === 'SUPER_ADMIN' || 
                           user.role === 'ADMIN' || 
                           attachment.chatId === user.id;

    if (!canCreateVersion) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Создаем новую версию
    const version = await prisma.attachmentVersion.create({
      data: {
        attachmentId: attachment.id,
        fileName,
        mime,
        bytes,
        objectKey,
        sha256,
        createdById: user.id,
        note: note || null
      }
    });

    // Обновляем основное вложение
    const updatedAttachment = await prisma.attachment.update({
      where: { id: attachment.id },
      data: {
        fileName,
        mime,
        bytes,
        objectKey,
        sha256,
        currentVerId: version.id,
        updatedAt: new Date()
      }
    });

    console.log(`New version created for attachment ${id}: ${version.id}`);

    return NextResponse.json({
      version: {
        id: version.id,
        fileName: version.fileName,
        mime: version.mime,
        bytes: version.bytes,
        createdAt: version.createdAt,
        note: version.note
      },
      attachment: {
        id: updatedAttachment.id,
        fileName: updatedAttachment.fileName,
        mime: updatedAttachment.mime,
        bytes: updatedAttachment.bytes,
        currentVerId: updatedAttachment.currentVerId,
        updatedAt: updatedAttachment.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Error creating new version:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create new version' 
    }, { status: 500 });
  }
}




