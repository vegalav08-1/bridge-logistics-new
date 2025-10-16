import { NextRequest } from 'next/server';
import { getCurrentUserFromToken, extractTokenFromHeader, CurrentUser } from '@yp/api';

/**
 * Извлекает текущего пользователя из запроса
 */
export async function getCurrentUser(request: NextRequest): Promise<CurrentUser> {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);
  return getCurrentUserFromToken(token);
}







