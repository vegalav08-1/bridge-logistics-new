import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface AvScanResult {
  clean: boolean;
  threats: string[];
  scanTime: number;
}

/**
 * Сканирует файл через ClamAV
 */
export async function scanFileWithClamAV(filePath: string): Promise<AvScanResult> {
  const startTime = Date.now();
  
  try {
    // Используем clamdscan для сканирования файла
    const { stdout } = await execAsync(`clamdscan "${filePath}"`);
    
    const scanTime = Date.now() - startTime;
    
    // Если файл чистый, clamdscan возвращает "OK"
    if (stdout.includes('OK')) {
      return {
        clean: true,
        threats: [],
        scanTime,
      };
    }
    
    // Если найдены угрозы, парсим вывод
    const threats: string[] = [];
    const lines = stdout.split('\n');
    
    for (const line of lines) {
      if (line.includes('FOUND')) {
        // Формат: "filename: threat_name FOUND"
        const match = line.match(/: (.+) FOUND$/);
        if (match) {
          threats.push(match[1]);
        }
      }
    }
    
    return {
      clean: threats.length === 0,
      threats,
      scanTime,
    };
  } catch (error) {
    const scanTime = Date.now() - startTime;
    
    // Если clamdscan не найден или не запущен, считаем файл чистым
    if (error instanceof Error && error.message.includes('clamdscan')) {
      console.warn('ClamAV not available, skipping scan');
      return {
        clean: true,
        threats: [],
        scanTime,
      };
    }
    
    // В случае других ошибок считаем файл подозрительным
    return {
      clean: false,
      threats: ['Scan error'],
      scanTime,
    };
  }
}

/**
 * Сканирует буфер через ClamAV (создает временный файл)
 */
export async function scanBufferWithClamAV(buffer: Buffer): Promise<AvScanResult> {
  const { writeFile, unlink } = await import('fs/promises');
  const { join } = await import('path');
  const { tmpdir } = await import('os');
  
  const tempFilePath = join(tmpdir(), `scan_${Date.now()}_${Math.random().toString(36).substring(7)}`);
  
  try {
    await writeFile(tempFilePath, buffer);
    return await scanFileWithClamAV(tempFilePath);
  } finally {
    await unlink(tempFilePath).catch(() => {});
  }
}

/**
 * Проверяет, доступен ли ClamAV
 */
export async function isClamAVAvailable(): Promise<boolean> {
  try {
    await execAsync('clamdscan --version');
    return true;
  } catch {
    return false;
  }
}

/**
 * Получает версию ClamAV
 */
export async function getClamAVVersion(): Promise<string | null> {
  try {
    const { stdout } = await execAsync('clamdscan --version');
    return stdout.trim();
  } catch {
    return null;
  }
}
