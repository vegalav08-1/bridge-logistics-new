import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { getCurrentUser } from '@/lib/auth';
import { FLAGS } from '@yp/shared';
import { createS3Client, getPresignedGet } from '@yp/files';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!FLAGS.FILES_OCR_ENABLED) {
    return NextResponse.json({ error: 'OCR is disabled' }, { status: 404 });
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
        meta: true
      }
    });

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found or access denied' }, { status: 404 });
    }

    // Check if OCR is done
    if (!attachment.meta?.ocrDone || !attachment.ocrTextKey) {
      return NextResponse.json({ error: 'OCR not available for this file' }, { status: 404 });
    }

    // Create S3 client
    const s3Client = createS3Client({
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      region: process.env.S3_REGION || 'us-east-1',
      bucket: process.env.S3_BUCKET || 'bridge-files',
      accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
      secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    });

    // Generate presigned URL for OCR text
    const getUrl = await getPresignedGet(s3Client, process.env.S3_BUCKET || 'bridge-files', {
      objectKey: attachment.ocrTextKey,
      expiresIn: 3600, // 1 hour
    });

    return NextResponse.json({
      url: getUrl,
      ocrLang: attachment.meta.ocrLang,
      ocrDone: attachment.meta.ocrDone,
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error getting attachment OCR:', error);
    return NextResponse.json({ error: error.message || 'Failed to get attachment OCR' }, { status: 500 });
  }
}