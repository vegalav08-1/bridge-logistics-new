// Утилиты для работы с @mentions

export type MentionUser = {
  id: string;
  name: string;
  avatar?: string;
};

/**
 * Извлекает упоминания из текста
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return [...new Set(mentions)]; // убираем дубликаты
}

/**
 * Проверяет, находится ли курсор в позиции упоминания
 */
export function isAtMentionPosition(text: string, cursorPosition: number): boolean {
  const beforeCursor = text.slice(0, cursorPosition);
  const atIndex = beforeCursor.lastIndexOf('@');
  
  // Если @ найден и перед ним пробел или начало строки
  if (atIndex >= 0) {
    const beforeAt = beforeCursor.slice(0, atIndex);
    return atIndex === 0 || /\s/.test(beforeAt[beforeAt.length - 1]);
  }
  
  return false;
}

/**
 * Получает запрос для поиска пользователей после @
 */
export function getMentionQuery(text: string, cursorPosition: number): string {
  const beforeCursor = text.slice(0, cursorPosition);
  const atIndex = beforeCursor.lastIndexOf('@');
  
  if (atIndex >= 0) {
    return beforeCursor.slice(atIndex + 1);
  }
  
  return '';
}

/**
 * Заменяет упоминание в тексте
 */
export function replaceMention(
  text: string, 
  cursorPosition: number, 
  oldQuery: string, 
  newMention: string
): { newText: string; newCursorPosition: number } {
  const beforeCursor = text.slice(0, cursorPosition);
  const afterCursor = text.slice(cursorPosition);
  
  const atIndex = beforeCursor.lastIndexOf('@');
  if (atIndex >= 0) {
    const beforeAt = beforeCursor.slice(0, atIndex);
    const newText = beforeAt + '@' + newMention + ' ' + afterCursor;
    const newCursorPosition = beforeAt.length + newMention.length + 2; // +2 для @ и пробела
    
    return { newText, newCursorPosition };
  }
  
  return { newText: text, newCursorPosition: cursorPosition };
}

