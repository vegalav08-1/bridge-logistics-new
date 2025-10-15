import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@yp/db';
import { FLAGS } from '@yp/shared';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { annotationId: string } }
) {
  if (!FLAGS.FILES_ANNOTATIONS_ENABLED) {
    return NextResponse.json({ error: 'Annotations disabled' }, { status: 404 });
  }

  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { annotationId } = params;

    // Получаем аннотацию с вложением
    const annotation = await prisma.annotation.findFirst({
      where: { id: annotationId },
      include: {
        attachment: {
          include: {
            chat: {
              select: { id: true, members: true }
            }
          }
        }
      }
    });

    if (!annotation) {
      return NextResponse.json({ error: 'Annotation not found' }, { status: 404 });
    }

    // Проверяем права доступа к чату
    const chat = annotation.attachment.chat;
    const hasAccess = chat.members.some((m: any) => m.userId === user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Проверяем права на удаление
    const canDelete = user.role === 'SUPER_ADMIN' || 
                     user.role === 'ADMIN' || 
                     annotation.authorId === user.id;

    if (!canDelete) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Удаляем аннотацию
    await prisma.annotation.delete({
      where: { id: annotationId }
    });

    // Создаем SystemCard в чате
    try {
      const systemMessage = await prisma.message.create({
        data: {
          chatId: annotation.attachment.chat.id,
          authorId: null, // System message
          kind: 'system',
          seq: await getNextSeq(annotation.attachment.chat.id),
          payload: JSON.stringify({
            type: 'annotation_deleted',
            attachmentId: annotation.attachmentId,
            annotationId: annotationId,
            fileName: annotation.attachment.fileName,
            authorId: user.id
          })
        }
      });

      console.log(`Annotation deleted: ${annotationId}`);
    } catch (error) {
      console.error('Error creating system message for annotation deletion:', error);
      // Не прерываем основной поток
    }

    return NextResponse.json({
      success: true,
      deletedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error deleting annotation:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to delete annotation' 
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
