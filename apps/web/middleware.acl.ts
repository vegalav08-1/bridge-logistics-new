import { NextRequest, NextResponse } from 'next/server';
import { canAccessAdminPanel } from './apps/web/src/lib/acl/role-guards';

export function aclMiddleware(req: NextRequest) {
  const url = new URL(req.url);
  
  // Проверяем доступ к админ панели
  if (url.pathname.startsWith('/admin')) {
    const role = req.cookies.get('user-role')?.value ?? 'USER';
    
    // Используем централизованную функцию проверки доступа
    if (!canAccessAdminPanel(role as 'SUPER_ADMIN' | 'ADMIN' | 'USER')) {
      url.pathname = '/403';
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}


