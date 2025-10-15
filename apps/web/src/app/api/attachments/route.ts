import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { getCurrentUser } from '@/lib/auth';
import { FLAGS } from '@yp/shared';

export async function GET(request: NextRequest) {
  if (!FLAGS.FILES_PREVIEW_ENABLED) {
    return NextResponse.json({ error: 'File preview is disabled' }, { status: 404 });
  }

  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const type = searchParams.get('type');
    const isSafe = searchParams.get('isSafe');
    const hasOCR = searchParams.get('hasOCR');
    const hasAnnotations = searchParams.get('hasAnnotations');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'uploadedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const whereClause: any = {
      chat: {
        members: {
          some: {
            userId: user.id
          }
        }
      }
    };

    if (chatId) {
      whereClause.chatId = chatId;
    }

    if (type) {
      whereClause.type = type;
    }

    if (isSafe !== null) {
      whereClause.isSafe = isSafe === 'true';
    }

    if (hasOCR === 'true') {
      whereClause.meta = { ocrDone: true };
    }

    if (hasAnnotations === 'true') {
      whereClause.annotations = { some: {} };
    }

    // Build order by clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get attachments
    const attachments = await prisma.attachment.findMany({
      where: whereClause,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        chat: {
          select: { id: true, number: true }
        },
        meta: true,
        versions: true,
        annotations: true
      }
    });

    // Get total count
    const totalCount = await prisma.attachment.count({
      where: whereClause
    });

    // Format response
    const results = attachments.map(attachment => ({
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
      stats: {
        versionCount: attachment.versions?.length || 0,
        annotationCount: attachment.annotations?.length || 0
      }
    }));

    return NextResponse.json({
      attachments: results,
      total: totalCount,
      limit,
      offset,
      sortBy,
      sortOrder
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error getting attachments:', error);
    return NextResponse.json({ error: error.message || 'Failed to get attachments' }, { status: 500 });
  }
}
