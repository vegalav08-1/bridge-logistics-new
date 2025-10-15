import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

export interface PdfMetadata {
  pages: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
}

export interface PdfThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
  page?: number; // номер страницы для превью (по умолчанию 1)
}

/**
 * Извлекает метаданные PDF
 */
export async function extractPdfMetadata(buffer: Buffer): Promise<PdfMetadata> {
  try {
    // Создаем временный файл
    const tempPdfPath = join(tmpdir(), `pdf_${Date.now()}.pdf`);
    await writeFile(tempPdfPath, buffer);

    try {
      // Используем pdfinfo для извлечения метаданных
      const { stdout } = await execAsync(`pdfinfo "${tempPdfPath}"`);
      
      const metadata: PdfMetadata = { pages: 0 };
      
      // Парсим вывод pdfinfo
      const lines = stdout.split('\n');
      for (const line of lines) {
        const [key, value] = line.split(':').map(s => s.trim());
        
        switch (key) {
          case 'Pages':
            metadata.pages = parseInt(value) || 0;
            break;
          case 'Title':
            metadata.title = value;
            break;
          case 'Author':
            metadata.author = value;
            break;
          case 'Subject':
            metadata.subject = value;
            break;
          case 'Creator':
            metadata.creator = value;
            break;
          case 'Producer':
            metadata.producer = value;
            break;
          case 'CreationDate':
            metadata.creationDate = new Date(value);
            break;
          case 'ModDate':
            metadata.modificationDate = new Date(value);
            break;
        }
      }
      
      return metadata;
    } finally {
      // Удаляем временный файл
      await unlink(tempPdfPath).catch(() => {});
    }
  } catch {
    console.error('Error extracting PDF metadata');
    return { pages: 0 };
  }
}

/**
 * Генерирует превью первой страницы PDF
 */
export async function generatePdfThumbnail(
  buffer: Buffer,
  options: PdfThumbnailOptions = {}
): Promise<Buffer> {
  const {
    width = 512,
    height: _height = 512,
    quality: _quality = 80,
    page = 1
  } = options;

  try {
    // Создаем временные файлы
    const tempPdfPath = join(tmpdir(), `pdf_${Date.now()}.pdf`);
    const tempPngPath = join(tmpdir(), `thumb_${Date.now()}.png`);
    
    await writeFile(tempPdfPath, buffer);

    try {
      // Используем pdftoppm для конвертации в PNG
      const command = `pdftoppm -png -singlefile -f ${page} -l ${page} -scale-to ${width} "${tempPdfPath}" "${tempPngPath.replace('.png', '')}"`;
      await execAsync(command);

      // Читаем сгенерированный PNG
      const thumbnailBuffer = await readFile(tempPngPath);
      
      return thumbnailBuffer;
    } finally {
      // Удаляем временные файлы
      await Promise.all([
        unlink(tempPdfPath).catch(() => {}),
        unlink(tempPngPath).catch(() => {})
      ]);
    }
  } catch {
    console.error('Error generating PDF thumbnail');
    throw new Error('Failed to generate PDF thumbnail');
  }
}

/**
 * Проверяет, является ли файл валидным PDF
 */
export async function validatePdf(buffer: Buffer): Promise<boolean> {
  try {
    // Проверяем PDF заголовок
    const header = buffer.toString('ascii', 0, 4);
    if (header !== '%PDF') {
      return false;
    }

    // Дополнительная проверка через pdfinfo
    const tempPdfPath = join(tmpdir(), `validate_${Date.now()}.pdf`);
    await writeFile(tempPdfPath, buffer);

    try {
      await execAsync(`pdfinfo "${tempPdfPath}"`);
      return true;
    } catch {
      return false;
    } finally {
      await unlink(tempPdfPath).catch(() => {});
    }
  } catch {
    return false;
  }
}

/**
 * Извлекает текст из PDF (для поиска)
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const tempPdfPath = join(tmpdir(), `extract_${Date.now()}.pdf`);
    await writeFile(tempPdfPath, buffer);

    try {
      const { stdout } = await execAsync(`pdftotext "${tempPdfPath}" -`);
      return stdout;
    } finally {
      await unlink(tempPdfPath).catch(() => {});
    }
  } catch {
    console.error('Error extracting PDF text');
    return '';
  }
}
