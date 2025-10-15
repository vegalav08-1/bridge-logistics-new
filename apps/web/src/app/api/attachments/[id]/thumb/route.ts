import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { getCurrentUser } from '@/lib/auth';
import { FLAGS } from '@yp/shared';
import { createS3Client, getPresignedGet } from '@yp/files';

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
      }
    });

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found or access denied' }, { status: 404 });
    }

    // Check if thumbnail exists
    if (!attachment.thumbKey) {
      return NextResponse.json({ error: 'Thumbnail not available' }, { status: 404 });
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

    // Generate presigned URL for thumbnail
    const getUrl = await getPresignedGet(s3Client, process.env.S3_BUCKET || 'bridge-files', {
      objectKey: attachment.thumbKey,
      expiresIn: 3600, // 1 hour
    });

    return NextResponse.json({
      url: getUrl,
      width: attachment.width,
      height: attachment.height,
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error getting attachment thumbnail:', error);
    return NextResponse.json({ error: error.message || 'Failed to get attachment thumbnail' }, { status: 500 });
  }
}