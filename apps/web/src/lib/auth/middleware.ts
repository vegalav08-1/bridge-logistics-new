/**
 * Middleware для проверки аутентификации и ролей
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from './session';

export interface AuthContext {
  userId: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
}

export function getAuthContext(request: NextRequest): AuthContext | null {
  const cookieHeader = request.headers.get('cookie');
  const session = getServerSession(cookieHeader || undefined);
  
  if (!session) return null;
  
  return {
    userId: session.userId,
    email: session.email,
    role: session.role
  };
}

export function requireAuth(request: NextRequest): AuthContext {
  const context = getAuthContext(request);
  
  if (!context) {
    throw new Error('Unauthorized');
  }
  
  return context;
}

export function requireRole(request: NextRequest, allowedRoles: string[]): AuthContext {
  const context = requireAuth(request);
  
  if (!allowedRoles.includes(context.role)) {
    throw new Error('Forbidden');
  }
  
  return context;
}

export function requireSuperAdmin(request: NextRequest): AuthContext {
  return requireRole(request, ['SUPER_ADMIN']);
}

export function requireAdminOrSuper(request: NextRequest): AuthContext {
  return requireRole(request, ['ADMIN', 'SUPER_ADMIN']);
}

// Функция для создания ответа с редиректом на логин
export function redirectToLogin(): NextResponse {
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
}

// Функция для создания ответа с ошибкой доступа
export function forbiddenResponse(): NextResponse {
  return NextResponse.redirect(new URL('/403', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
}
