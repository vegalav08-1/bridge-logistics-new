import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { getCurrentUser } from '@/lib/auth';
import { FLAGS } from '@yp/shared';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; annotationId: string } }
) {
  if (!FLAGS.FILES_ANNOTATIONS_ENABLED) {
    return NextResponse.json({ error: 'Annotations are disabled' }, { status: 404 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, annotationId } = params;

    // Get annotation with access check
    const annotation = await prisma.annotation.findFirst({
      where: {
        id: annotationId,
        attachmentId: id,
        attachment: {
          chat: {
            members: {
              some: {
                userId: user.id
              }
            }
          }
        }
      }
    });

    if (!annotation) {
      return NextResponse.json({ error: 'Annotation not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({
      annotation: {
        id: annotation.id,
        authorId: annotation.authorId,
        page: annotation.page,
        rect: annotation.rect ? JSON.parse(annotation.rect) : null,
        content: annotation.content,
        createdAt: annotation.createdAt,
        updatedAt: annotation.updatedAt
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error getting annotation:', error);
    return NextResponse.json({ error: error.message || 'Failed to get annotation' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; annotationId: string } }
) {
  if (!FLAGS.FILES_ANNOTATIONS_ENABLED) {
    return NextResponse.json({ error: 'Annotations are disabled' }, { status: 404 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, annotationId } = params;
    const body = await request.json();
    const { content, page, rect } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Get annotation with access check
    const annotation = await prisma.annotation.findFirst({
      where: {
        id: annotationId,
        attachmentId: id,
        authorId: user.id, // Only author can edit
        attachment: {
          chat: {
            members: {
              some: {
                userId: user.id
              }
            }
          }
        }
      }
    });

    if (!annotation) {
      return NextResponse.json({ error: 'Annotation not found or access denied' }, { status: 404 });
    }

    // Update annotation
    const updatedAnnotation = await prisma.annotation.update({
      where: { id: annotationId },
      data: {
        content: content.trim(),
        page: page || null,
        rect: rect ? JSON.stringify(rect) : null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      annotation: {
        id: updatedAnnotation.id,
        authorId: updatedAnnotation.authorId,
        page: updatedAnnotation.page,
        rect: updatedAnnotation.rect ? JSON.parse(updatedAnnotation.rect) : null,
        content: updatedAnnotation.content,
        createdAt: updatedAnnotation.createdAt,
        updatedAt: updatedAnnotation.updatedAt
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating annotation:', error);
    return NextResponse.json({ error: error.message || 'Failed to update annotation' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; annotationId: string } }
) {
  if (!FLAGS.FILES_ANNOTATIONS_ENABLED) {
    return NextResponse.json({ error: 'Annotations are disabled' }, { status: 404 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, annotationId } = params;

    // Get annotation with access check
    const annotation = await prisma.annotation.findFirst({
      where: {
        id: annotationId,
        attachmentId: id,
        authorId: user.id, // Only author can delete
        attachment: {
          chat: {
            members: {
              some: {
                userId: user.id
              }
            }
          }
        }
      }
    });

    if (!annotation) {
      return NextResponse.json({ error: 'Annotation not found or access denied' }, { status: 404 });
    }

    // Delete annotation
    await prisma.annotation.delete({
      where: { id: annotationId }
    });

    return NextResponse.json({ message: 'Annotation deleted successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('Error deleting annotation:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete annotation' }, { status: 500 });
  }
}




