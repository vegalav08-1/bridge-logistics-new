import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { getCurrentUser } from '@/lib/auth';
import { FLAGS } from '@yp/shared';
import { createS3Client, getPresignedGet } from '@yp/files';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  if (!FLAGS.FILES_VERSIONING_ENABLED) {
    return NextResponse.json({ error: 'File versioning is disabled' }, { status: 404 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, versionId } = params;

    // Get version with access check
    const version = await prisma.attachmentVersion.findFirst({
      where: {
        id: versionId,
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

    if (!version) {
      return NextResponse.json({ error: 'Version not found or access denied' }, { status: 404 });
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

    // Generate presigned URL for version
    const getUrl = await getPresignedGet(s3Client, process.env.S3_BUCKET || 'bridge-files', {
      objectKey: version.objectKey,
      expiresIn: 300, // 5 minutes
    });

    return NextResponse.json({
      url: getUrl,
      fileName: version.fileName,
      mime: version.mime,
      bytes: version.bytes,
      expiresAt: new Date(Date.now() + 300000).toISOString()
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error getting version URL:', error);
    return NextResponse.json({ error: error.message || 'Failed to get version URL' }, { status: 500 });
  }
}







