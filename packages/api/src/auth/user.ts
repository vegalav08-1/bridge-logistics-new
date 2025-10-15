import { verifyAccess } from './tokens';
import { prisma } from '@yp/db';

export interface CurrentUser {
  id: string;
  email: string;
  role: string;
  parentAdminId: string | null;
  emailVerified: boolean;
}

/**
 * Извлекает текущего пользователя из токена
 */
export async function getCurrentUserFromToken(token: string): Promise<CurrentUser> {
  // Верифицируем токен
  let payload: any;
  try {
    payload = verifyAccess(token);
  } catch {
    throw new Error('Неверный токен');
  }

  // Находим пользователя
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      role: true,
      parentAdminId: true,
      emailVerified: true
    }
  });

  if (!user) {
    throw new Error('Пользователь не найден');
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    parentAdminId: user.parentAdminId,
    emailVerified: !!user.emailVerified
  };
}

/**
 * Извлекает токен из заголовка Authorization
 */
export function extractTokenFromHeader(authHeader: string | null): string {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Токен не найден');
  }
  return authHeader.substring(7);
}
