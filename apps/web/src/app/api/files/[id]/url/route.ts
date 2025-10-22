import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { FileUrlSchema } from '@/lib/chat-media/schemas';
import { CHAT_MEDIA_V1 } from '@/lib/flags';

// CH-01: API для получения подписанных URL файлов
// GET /api/files/[id]/url?variant=original|thumb|poster|hls&width=256&height=256&expiresIn=3600

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!CHAT_MEDIA_V1) {
    return NextResponse.json({ error: 'Feature not enabled' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const fileId = params.id;
    
    // Валидируем параметры запроса
    const queryData = FileUrlSchema.parse({
      fileId,
      variant: searchParams.get('variant') || 'original',
      width: searchParams.get('width') ? parseInt(searchParams.get('width')!) : undefined,
      height: searchParams.get('height') ? parseInt(searchParams.get('height')!) : undefined,
      expiresIn: searchParams.get('expiresIn') ? parseInt(searchParams.get('expiresIn')!) : 3600
    });
    
    const { variant, width, height, expiresIn } = queryData;
    
    // Получаем файл из БД
    const file = await getFileById(fileId);
    if (!file) {
      return NextResponse.json({
        error: 'File not found'
      }, { status: 404 });
    }
    
    // Проверяем права доступа
    const hasAccess = await checkFileAccess(fileId, 'user-1'); // TODO: получить из сессии
    if (!hasAccess) {
      return NextResponse.json({
        error: 'Access denied'
      }, { status: 403 });
    }
    
    // Генерируем подписанный URL
    const signedUrl = await generateSignedUrl(file.storage_key, variant, {
      width,
      height,
      expiresIn
    });
    
    // Логируем доступ к файлу
    await logFileAccess(fileId, 'user-1', variant);
    
    return NextResponse.json({
      success: true,
      url: signedUrl,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      variant,
      file: {
        id: file.id,
        name: file.name,
        size: file.size_bytes,
        mime: file.mime,
        kind: file.kind
      }
    });
    
  } catch (error) {
    console.error('File URL error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      error: 'Failed to generate file URL'
    }, { status: 500 });
  }
}

// Получение файла по ID
async function getFileById(fileId: string) {
  // TODO: Реализовать запрос к БД
  // SELECT * FROM chat_file WHERE id = ?
  return {
    id: fileId,
    storage_key: `chats/chat-123/${fileId}/original`,
    name: 'example.jpg',
    size_bytes: 1024000,
    mime: 'image/jpeg',
    kind: 'image'
  };
}

// Проверка прав доступа к файлу
async function checkFileAccess(fileId: string, userId: string) {
  // TODO: Реализовать проверку ACL
  // Проверяем, что пользователь является участником чата
  return true;
}

// Генерация подписанного URL
async function generateSignedUrl(
  storageKey: string, 
  variant: string = 'original',
  options: {
    width?: number;
    height?: number;
    expiresIn: number;
  } = { expiresIn: 3600 }
) {
  const { width, height, expiresIn } = options;
  
  // Определяем ключ для варианта файла
  let key = storageKey;
  if (variant === 'thumb' && width && height) {
    key = storageKey.replace('/original', `/thumb_${width}x${height}.webp`);
  } else if (variant === 'poster') {
    key = storageKey.replace('/original', '/poster.jpg');
  } else if (variant === 'hls') {
    key = storageKey.replace('/original', '/hls/playlist.m3u8');
  }
  
  // TODO: Реализовать S3 signed URL с правильными параметрами
  const params = new URLSearchParams({
    expires: Math.floor(Date.now() / 1000) + expiresIn,
    variant,
    ...(width && { width: width.toString() }),
    ...(height && { height: height.toString() })
  });
  
  return `https://s3.example.com/${key}?${params.toString()}`;
}

// Логирование доступа к файлу
async function logFileAccess(fileId: string, userId: string, variant: string) {
  // TODO: Реализовать запись в audit_log
  console.log('File access logged:', { fileId, userId, variant });
}