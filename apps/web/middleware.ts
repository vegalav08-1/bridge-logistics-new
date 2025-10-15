import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, redirectToLogin, forbiddenResponse } from '@/lib/auth/middleware';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  
  // Публичные маршруты, которые не требуют аутентификации
  const publicRoutes = [
    '/login',
    '/register', 
    '/forgot',
    '/verify',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot',
    '/api/auth/verify',
    '/api/auth/refresh',
    '/api/auth/logout',
    '/api/auth/signout',
    '/api/auth/logout-all',
    '/api/auth/reset',
    '/_next',
    '/favicon.ico',
    '/icons',
    '/manifest.json'
  ];

  // Проверяем, является ли маршрут публичным
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Если это публичный маршрут, пропускаем проверку аутентификации
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Получаем контекст аутентификации
  const authContext = getAuthContext(request);
  
  if (!authContext) {
    // Если пользователь не авторизован, перенаправляем на логин
    return redirectToLogin();
  }

  // Проверяем доступ к админ панели
  if (pathname.startsWith('/admin')) {
    if (authContext.role !== 'SUPER_ADMIN') {
      return forbiddenResponse();
    }
  }

  // Проверяем доступ к API админ панели
  if (pathname.startsWith('/api/admin')) {
    if (authContext.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
