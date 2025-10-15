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
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error getting version:', error);
    return NextResponse.json({ error: error.message || 'Failed to get version' }, { status: 500 });
  }
}

export async function DELETE(
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
        createdById: user.id, // Only creator can delete
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

    // Delete version
    await prisma.attachmentVersion.delete({
      where: { id: versionId }
    });

    return NextResponse.json({ message: 'Version deleted successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('Error deleting version:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete version' }, { status: 500 });
  }
}




