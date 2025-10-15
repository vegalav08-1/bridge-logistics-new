/**
 * Утилиты для курсорной пагинации
 * Курсор: base64("updatedAt:chatId")
 */

export interface CursorData {
  updatedAt: string;
  id: string;
}

export function encodeCursor(data: CursorData): string {
  const payload = `${data.updatedAt}:${data.id}`;
  return btoa(payload);
}

export function decodeCursor(cursor: string): CursorData | null {
  try {
    const payload = atob(cursor);
    const [updatedAt, id] = payload.split(':');
    
    if (!updatedAt || !id) {
      return null;
    }
    
    return { updatedAt, id };
  } catch {
    return null;
  }
}

export function createCursorFilter(cursor: string | null): Record<string, unknown> {
  if (!cursor) {
    return {};
  }
  
  const cursorData = decodeCursor(cursor);
  if (!cursorData) {
    return {};
  }
  
  return {
    OR: [
      { updatedAt: { lt: cursorData.updatedAt } },
      { 
        updatedAt: cursorData.updatedAt, 
        id: { lt: cursorData.id } 
      }
    ]
  };
}
