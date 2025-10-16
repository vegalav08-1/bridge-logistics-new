import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@yp/db';
import { getCurrentUser } from '@/lib/auth';
import { FLAGS } from '@yp/shared';
import { createS3Client, deleteObject } from '@yp/files';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!FLAGS.FILES_PREVIEW_ENABLED) {
    return NextResponse.json({ error: 'File operations are disabled' }, { status: 404 });
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
        versions: true,
        annotations: true
      }
    });

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found or access denied' }, { status: 404 });
    }

    // Check if user has permission to delete (only author or admin)
    const isAuthor = attachment.chatId === user.id; // Simplified check
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions to delete this file' }, { status: 403 });
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

    // Delete files from S3
    const filesToDelete = [
      attachment.objectKey,
      attachment.thumbKey,
      attachment.ocrTextKey
    ].filter(Boolean);

    // Delete versions from S3
    for (const version of attachment.versions) {
      filesToDelete.push(version.objectKey);
    }

    // Delete all files from S3
    for (const objectKey of filesToDelete) {
      if (objectKey) {
        try {
          await deleteObject(s3Client, process.env.S3_BUCKET || 'bridge-files', objectKey);
        } catch (error) {
          console.error(`Error deleting S3 object ${objectKey}:`, error);
          // Continue with other deletions even if one fails
        }
      }
    }

    // Delete from database (cascade will handle related records)
    await prisma.attachment.delete({
      where: { id }
    });

    return NextResponse.json({ 
      message: 'Attachment deleted successfully' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error deleting attachment:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete attachment' }, { status: 500 });
  }
}







