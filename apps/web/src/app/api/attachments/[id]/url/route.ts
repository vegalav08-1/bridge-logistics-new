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
    const { searchParams } = new URL(request.url);
    const version = searchParams.get('version'); // Optional version ID

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
        chat: {
          select: { id: true, title: true }
        }
      }
    });

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found or access denied' }, { status: 404 });
    }

    // Check if file is safe (if antivirus is enabled)
    if (FLAGS.FILES_ANTIVIRUS_ENABLED && !attachment.isSafe) {
      return NextResponse.json({ error: 'File is not safe to download' }, { status: 403 });
    }

    // Get version if specified
    let objectKey = attachment.objectKey;
    if (version) {
      const attachmentVersion = await prisma.attachmentVersion.findFirst({
        where: {
          id: version,
          attachmentId: id
        }
      });

      if (!attachmentVersion) {
        return NextResponse.json({ error: 'Version not found' }, { status: 404 });
      }

      objectKey = attachmentVersion.objectKey;
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

    // Generate presigned URL
    const getUrl = await getPresignedGet(s3Client, process.env.S3_BUCKET || 'bridge-files', {
      objectKey,
      expiresIn: 300, // 5 minutes
    });

    return NextResponse.json({
      url: getUrl,
      fileName: attachment.fileName,
      mime: attachment.mime,
      bytes: attachment.bytes,
      expiresAt: new Date(Date.now() + 300000).toISOString()
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error getting attachment URL:', error);
    return NextResponse.json({ error: error.message || 'Failed to get attachment URL' }, { status: 500 });
  }
}