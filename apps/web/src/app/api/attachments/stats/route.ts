import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { getCurrentUser } from '@/lib/auth';
import { FLAGS } from '@yp/shared';

export async function GET(request: NextRequest) {
  if (!FLAGS.FILES_PREVIEW_ENABLED) {
    return NextResponse.json({ error: 'File preview is disabled' }, { status: 404 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

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

    // Get basic stats
    const [
      totalFiles,
      totalSize,
      safeFiles,
      unsafeFiles,
      ocrFiles,
      annotatedFiles,
      versionedFiles
    ] = await Promise.all([
      // Total files
      prisma.attachment.count({ where: whereClause }),
      
      // Total size
      prisma.attachment.aggregate({
        where: whereClause,
        _sum: { bytes: true }
      }),
      
      // Safe files
      prisma.attachment.count({
        where: { ...whereClause, isSafe: true }
      }),
      
      // Unsafe files
      prisma.attachment.count({
        where: { ...whereClause, isSafe: false }
      }),
      
      // Files with OCR
      prisma.attachment.count({
        where: {
          ...whereClause,
          meta: { ocrDone: true }
        }
      }),
      
      // Files with annotations
      prisma.attachment.count({
        where: {
          ...whereClause,
          annotations: { some: {} }
        }
      }),
      
      // Files with versions
      prisma.attachment.count({
        where: {
          ...whereClause,
          versions: { some: {} }
        }
      })
    ]);

    // Get file type distribution
    const fileTypes = await prisma.attachment.groupBy({
      by: ['type'],
      where: whereClause,
      _count: { type: true },
      _sum: { bytes: true }
    });

    // Get recent files
    const recentFiles = await prisma.attachment.findMany({
      where: whereClause,
      orderBy: { uploadedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        fileName: true,
        type: true,
        mime: true,
        bytes: true,
        isSafe: true,
        uploadedAt: true,
        chat: {
          select: { id: true, title: true }
        }
      }
    });

    // Get storage usage by chat
    const storageByChat = await prisma.attachment.groupBy({
      by: ['chatId'],
      where: whereClause,
      _sum: { bytes: true },
      _count: { id: true },
      orderBy: { _sum: { bytes: 'desc' } },
      take: 10
    });

    return NextResponse.json({
      summary: {
        totalFiles,
        totalSize: totalSize._sum.bytes || 0,
        safeFiles,
        unsafeFiles,
        ocrFiles,
        annotatedFiles,
        versionedFiles
      },
      fileTypes: fileTypes.map(ft => ({
        type: ft.type,
        count: ft._count.type,
        size: ft._sum.bytes || 0
      })),
      recentFiles: recentFiles.map(f => ({
        id: f.id,
        fileName: f.fileName,
        type: f.type,
        mime: f.mime,
        bytes: f.bytes,
        isSafe: f.isSafe,
        uploadedAt: f.uploadedAt,
        chat: f.chat
      })),
      storageByChat: storageByChat.map(s => ({
        chatId: s.chatId,
        fileCount: s._count.id,
        totalSize: s._sum.bytes || 0
      }))
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error getting attachment stats:', error);
    return NextResponse.json({ error: error.message || 'Failed to get attachment stats' }, { status: 500 });
  }
}




