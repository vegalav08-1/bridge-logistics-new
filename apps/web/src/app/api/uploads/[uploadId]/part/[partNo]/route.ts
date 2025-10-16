import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@yp/db';
import { FLAGS } from '@yp/shared';

export async function PUT(
  request: NextRequest,
  { params }: { params: { uploadId: string; partNo: string } }
) {
  if (!FLAGS.CHUNK_UPLOADS_ENABLED) {
    return NextResponse.json({ error: 'Chunked uploads disabled' }, { status: 404 });
  }

  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { uploadId, partNo } = params;
    const partNumber = parseInt(partNo);

    if (isNaN(partNumber) || partNumber < 1) {
      return NextResponse.json({ error: 'Invalid part number' }, { status: 400 });
    }

    // Получаем сессию загрузки
    const uploadSession = await prisma.uploadSession.findFirst({
      where: {
        id: uploadId,
        userId: user.id,
        status: { in: ['INIT', 'UPLOADING'] }
      }
    });

    if (!uploadSession) {
      return NextResponse.json({ error: 'Upload session not found' }, { status: 404 });
    }

    // Проверяем размер части
    const expectedSize = partNumber === Math.ceil(uploadSession.totalSize / uploadSession.partSize)
      ? uploadSession.totalSize - (partNumber - 1) * uploadSession.partSize
      : uploadSession.partSize;

    const contentLength = parseInt(request.headers.get('content-length') || '0');
    if (contentLength > expectedSize) {
      return NextResponse.json({ error: 'Part size exceeds limit' }, { status: 400 });
    }

    // Получаем данные части
    const chunkData = await request.arrayBuffer();
    
    // Вычисляем checksum
    const hashBuffer = await crypto.subtle.digest('SHA-256', chunkData);
    const checksum = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Обновляем статус сессии
    if (uploadSession.status === 'INIT') {
      await prisma.uploadSession.update({
        where: { id: uploadId },
        data: { status: 'UPLOADING' }
      });
    }

    // Сохраняем информацию о части
    await prisma.uploadPart.create({
      data: {
        uploadId,
        partNumber,
        size: chunkData.byteLength,
        checksum,
        status: 'UPLOADED'
      }
    });

    console.log(`Upload part ${partNumber} completed for session ${uploadId}`);

    return NextResponse.json({
      partNumber,
      size: chunkData.byteLength,
      checksum
    });

  } catch (error: any) {
    console.error('Error uploading part:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to upload part' 
    }, { status: 500 });
  }
}







