import crypto from 'node:crypto';

// Генерируем короткий токен для URL (base58-like)
export function generateReferralToken(): string {
  // Используем base64url для URL-безопасности, убираем padding
  const bytes = crypto.randomBytes(8);
  return bytes.toString('base64url').replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
}

// Проверяем уникальность токена
export async function isTokenUnique(token: string, prisma: any): Promise<boolean> {
  const existing = await prisma.referralToken.findUnique({
    where: { token }
  });
  return !existing;
}








