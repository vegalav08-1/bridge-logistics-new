import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { getCurrentUser } from '@/lib/auth';
import { FLAGS } from '@yp/shared';
import { createS3Client, uploadFile } from '@yp/files';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!FLAGS.FILES_VERSIONING_ENABLED) {
    return NextResponse.json({ error: 'File versioning is disabled' }, { status: 404 });
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

    // Get versions
    const versions = await prisma.attachmentVersion.findMany({
      where: { attachmentId: id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      versions: versions.map(v => ({
        id: v.id,
        fileName: v.fileName,
        mime: v.mime,
        bytes: v.bytes,
        sha256: v.sha256,
        createdById: v.createdById,
        createdAt: v.createdAt,
        note: v.note
      }))
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error getting versions:', error);
    return NextResponse.json({ error: error.message || 'Failed to get versions' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!FLAGS.FILES_VERSIONING_ENABLED) {
    return NextResponse.json({ error: 'File versioning is disabled' }, { status: 404 });
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const note = formData.get('note') as string;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Validate file size (optional)
    const maxSize = 100 * 1024 * 1024; // 100 MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds maximum limit' }, { status: 400 });
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

    // Generate object key for version
    const versionId = uuidv4();
    const objectKey = `attachments/${attachment.chatId}/${attachment.id}/versions/${versionId}/${file.name}`;

    // Upload file to S3
    const uploadResult = await uploadFile(s3Client, process.env.S3_BUCKET || 'bridge-files', {
      objectKey,
      file,
      contentType: file.type
    });

    // Create version record
    const version = await prisma.attachmentVersion.create({
      data: {
        id: versionId,
        attachmentId: id,
        fileName: file.name,
        mime: file.type,
        bytes: file.size,
        objectKey,
        sha256: uploadResult.etag, // Use ETag as SHA256 placeholder
        createdById: user.id,
        note: note || null
      }
    });

    return NextResponse.json({
      version: {
        id: version.id,
        fileName: version.fileName,
        mime: version.mime,
        bytes: version.bytes,
        sha256: version.sha256,
        createdById: version.createdById,
        createdAt: version.createdAt,
        note: version.note
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating version:', error);
    return NextResponse.json({ error: error.message || 'Failed to create version' }, { status: 500 });
  }
}




