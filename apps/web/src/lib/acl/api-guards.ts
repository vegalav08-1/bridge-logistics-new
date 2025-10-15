// API Guards для проверки доступа к API endpoints

import { NextRequest, NextResponse } from 'next/server';
import { 
  canAccessAdminAPI, 
  canAccessAdminUsersAPI, 
  canAccessAdminPartnersAPI,
  canAccessPackingAPI,
  canAccessAnnotationsAPI,
  canAccessAttachmentsAPI,
  UserRole 
} from './role-guards';

// Функция для извлечения роли пользователя из запроса
export function getUserRoleFromRequest(request: NextRequest): UserRole {
  // В реальном приложении здесь была бы проверка JWT токена
  // Для mock данных используем заголовок или cookie
  const roleHeader = request.headers.get('x-user-role');
  const roleCookie = request.cookies.get('user-role')?.value;
  
  // Возвращаем роль из заголовка, cookie или по умолчанию USER
  const role = roleHeader || roleCookie || 'USER';
  
  // Валидируем роль
  if (['SUPER_ADMIN', 'ADMIN', 'USER'].includes(role)) {
    return role as UserRole;
  }
  
  return 'USER';
}

// Guard для админ API
export function requireAdminAccess(request: NextRequest) {
  const role = getUserRoleFromRequest(request);
  
  if (!canAccessAdminAPI(role)) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }
  
  return null; // Доступ разрешен
}

// Guard для управления пользователями
export function requireUserManagementAccess(request: NextRequest) {
  const role = getUserRoleFromRequest(request);
  
  if (!canAccessAdminUsersAPI(role)) {
    return NextResponse.json(
      { error: 'User management access required' },
      { status: 403 }
    );
  }
  
  return null;
}

// Guard для управления партнерами
export function requirePartnerManagementAccess(request: NextRequest) {
  const role = getUserRoleFromRequest(request);
  
  if (!canAccessAdminPartnersAPI(role)) {
    return NextResponse.json(
      { error: 'Partner management access required' },
      { status: 403 }
    );
  }
  
  return null;
}

// Guard для packing API
export function requirePackingAccess(request: NextRequest) {
  const role = getUserRoleFromRequest(request);
  
  if (!canAccessPackingAPI(role)) {
    return NextResponse.json(
      { error: 'Packing access required' },
      { status: 403 }
    );
  }
  
  return null;
}

// Guard для annotations API
export function requireAnnotationsAccess(request: NextRequest) {
  const role = getUserRoleFromRequest(request);
  
  if (!canAccessAnnotationsAPI(role)) {
    return NextResponse.json(
      { error: 'Annotations access required' },
      { status: 403 }
    );
  }
  
  return null;
}

// Guard для attachments API
export function requireAttachmentsAccess(request: NextRequest) {
  const role = getUserRoleFromRequest(request);
  
  if (!canAccessAttachmentsAPI(role)) {
    return NextResponse.json(
      { error: 'Attachments access required' },
      { status: 403 }
    );
  }
  
  return null;
}

// Универсальная функция для проверки доступа
export function requireAccess(
  request: NextRequest, 
  accessFunction: (role: UserRole) => boolean,
  errorMessage: string = 'Access denied'
) {
  const role = getUserRoleFromRequest(request);
  
  if (!accessFunction(role)) {
    return NextResponse.json(
      { error: errorMessage },
      { status: 403 }
    );
  }
  
  return null;
}
