export function sanitizeText(raw: string): string {
  // минимальная очистка: убираем управляющие символы, нормализуем переносы
  return raw.replace(/\u0000/g,'').replace(/\r\n?/g,'\n').trim();
}

