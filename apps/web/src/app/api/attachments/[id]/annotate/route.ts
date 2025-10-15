import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { getCurrentUser } from '@/lib/auth';
import { FLAGS } from '@yp/shared';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!FLAGS.FILES_ANNOTATIONS_ENABLED) {
    return NextResponse.json({ error: 'Annotations are disabled' }, { status: 404 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { content, page, rect } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Get attachment with access check
    const attachment = await prisma.attachment.findFirst({
      where: {
        id,
        chat: {
          members: {
            some: {
              userId: user.id
            }
          }
        }
      }
    });

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found or access denied' }, { status: 404 });
    }

    // Create annotation
    const annotation = await prisma.annotation.create({
      data: {
        attachmentId: id,
        authorId: user.id,
        page: page || null,
        rect: rect ? JSON.stringify(rect) : null,
        content: content.trim()
      }
    });

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
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating annotation:', error);
    return NextResponse.json({ error: error.message || 'Failed to create annotation' }, { status: 500 });
  }
}