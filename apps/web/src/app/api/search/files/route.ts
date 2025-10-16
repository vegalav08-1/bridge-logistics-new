import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { getCurrentUser } from '@/lib/auth';
import { FLAGS } from '@yp/shared';

export async function GET(request: NextRequest) {
  if (!FLAGS.FILES_OCR_ENABLED) {
    return NextResponse.json({ error: 'OCR search is disabled' }, { status: 404 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    // Search in attachments with OCR text
    const attachments = await prisma.attachment.findMany({
      where: {
        chat: {
          members: {
            some: {
              userId: user.id
            }
          }
        },
        meta: {
          ocrDone: true
        },
        // Note: This is a simplified search. In production, you'd use a proper search engine
        // like Elasticsearch or Meilisearch for full-text search on OCR content
        OR: [
          {
            fileName: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            meta: {
              ocrLang: {
                contains: query,
                mode: 'insensitive'
              }
            }
          }
        ]
      },
      include: {
        chat: {
          select: { id: true, title: true }
        },
        meta: true
      },
      orderBy: { uploadedAt: 'desc' },
      take: limit,
      skip: offset
    });

    // Format results
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
      isSafe: attachment.isSafe,
      uploadedAt: attachment.uploadedAt,
      chat: attachment.chat,
      meta: attachment.meta ? {
        ocrDone: attachment.meta.ocrDone,
        ocrLang: attachment.meta.ocrLang
      } : null
    }));

    return NextResponse.json({
      results,
      total: results.length,
      query,
      limit,
      offset
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error searching files:', error);
    return NextResponse.json({ error: error.message || 'Failed to search files' }, { status: 500 });
  }
}







