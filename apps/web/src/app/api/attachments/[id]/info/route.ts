import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { getCurrentUser } from '@/lib/auth';
import { FLAGS } from '@yp/shared';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!FLAGS.FILES_PREVIEW_ENABLED) {
    return NextResponse.json({ error: 'File preview is disabled' }, { status: 404 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

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
      },
      include: {
        meta: true,
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 5 // Limit to recent versions
        },
        annotations: {
          orderBy: { createdAt: 'desc' },
          take: 10 // Limit to recent annotations
        },
        chat: {
          select: { id: true, title: true }
        }
      }
    });

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found or access denied' }, { status: 404 });
    }

    // Format response
    const info = {
      id: attachment.id,
      fileName: attachment.fileName,
      type: attachment.type,
      mime: attachment.mime,
      bytes: attachment.bytes,
      width: attachment.width,
      height: attachment.height,
      pages: attachment.pages,
      thumbKey: attachment.thumbKey,
      ocrTextKey: attachment.ocrTextKey,
      sha256: attachment.sha256,
      isSafe: attachment.isSafe,
      currentVerId: attachment.currentVerId,
      uploadedAt: attachment.uploadedAt,
      updatedAt: attachment.updatedAt,
      chat: attachment.chat,
      meta: attachment.meta ? {
        pages: attachment.meta.pages,
        width: attachment.meta.width,
        height: attachment.meta.height,
        ocrDone: attachment.meta.ocrDone,
        ocrLang: attachment.meta.ocrLang,
        avScannedAt: attachment.meta.avScannedAt,
        exifStripped: attachment.meta.exifStripped
      } : null,
      versions: attachment.versions.map(v => ({
        id: v.id,
        fileName: v.fileName,
        mime: v.mime,
        bytes: v.bytes,
        sha256: v.sha256,
        createdById: v.createdById,
        createdAt: v.createdAt,
        note: v.note
      })),
      annotations: attachment.annotations.map(a => ({
        id: a.id,
        authorId: a.authorId,
        page: a.page,
        rect: a.rect ? JSON.parse(a.rect) : null,
        content: a.content,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt
      })),
      stats: {
        versionCount: attachment.versions.length,
        annotationCount: attachment.annotations.length,
        hasThumbnail: !!attachment.thumbKey,
        hasOCR: !!attachment.meta?.ocrDone,
        isSafe: attachment.isSafe
      }
    };

    return NextResponse.json(info, { status: 200 });

  } catch (error: any) {
    console.error('Error getting attachment info:', error);
    return NextResponse.json({ error: error.message || 'Failed to get attachment info' }, { status: 500 });
  }
}







