import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { UploadInitSchema } from '@/lib/chat-media/schemas';
import { CHAT_MEDIA_V1 } from '@/lib/flags';

// CH-01: API для инициализации загрузки файлов
// POST /api/files/init

export async function POST(request: NextRequest) {
  if (!CHAT_MEDIA_V1) {
    return NextResponse.json({ error: 'Feature not enabled' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validatedData = UploadInitSchema.parse(body);
    
    const { chatId, name, size, mime, sha256, kind, meta } = validatedData;
    
    // Проверяем дедупликацию по sha256+size
    const existingFile = await checkFileDeduplication(sha256, size);
    if (existingFile) {
      return NextResponse.json({
        success: true,
        fileId: existingFile.id,
        deduplicated: true,
        url: await generateSignedUrl(existingFile.storage_key, 'original')
      });
    }
    
    // Создаем новый файл в БД
    const fileId = crypto.randomUUID();
    const storageKey = `chats/${chatId}/${fileId}/original`;
    
    // Генерируем presigned URL для загрузки
    const uploadUrl = await generatePresignedUploadUrl(storageKey, mime);
    
    // Сохраняем файл в БД
    await createFileRecord({
      id: fileId,
      chatId,
      uploaderId: 'user-1', // TODO: получить из сессии
      kind,
      name,
      sizeBytes: size,
      mime,
      sha256,
      storageKey,
      metaJson: meta || {}
    });
    
    return NextResponse.json({
      success: true,
      fileId,
      uploadUrl,
      uploadId: crypto.randomUUID(), // для отслеживания загрузки
      partSize: Math.min(10 * 1024 * 1024, size), // 10MB чанки
      expiresIn: 3600 // 1 час
    });
    
  } catch (error) {
    console.error('Upload init error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      error: 'Failed to initialize upload'
    }, { status: 500 });
  }
}

// Проверка дедупликации по sha256+size
async function checkFileDeduplication(sha256: string, size: number) {
  // TODO: Реализовать запрос к БД
  // SELECT * FROM chat_file WHERE sha256 = ? AND size_bytes = ?
  return null;
}

// Генерация presigned URL для загрузки
async function generatePresignedUploadUrl(storageKey: string, mime: string) {
  // TODO: Реализовать S3 presigned URL
  return `https://s3.example.com/${storageKey}?presigned=true`;
}

// Генерация подписанного URL для доступа к файлу
async function generateSignedUrl(storageKey: string, variant: string = 'original') {
  // TODO: Реализовать S3 signed URL
  return `https://s3.example.com/${storageKey}?signed=true&variant=${variant}`;
}

// Создание записи файла в БД
async function createFileRecord(data: {
  id: string;
  chatId: string;
  uploaderId: string;
  kind: string;
  name: string;
  sizeBytes: number;
  mime: string;
  sha256: string;
  storageKey: string;
  metaJson: any;
}) {
  // TODO: Реализовать INSERT в БД
  console.log('Creating file record:', data);
}
