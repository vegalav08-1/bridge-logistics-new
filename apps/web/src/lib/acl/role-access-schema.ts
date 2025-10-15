/**
 * ЧЕТКАЯ СХЕМА ДОСТУПА ДЛЯ ВСЕХ РОЛЕЙ
 * 
 * Эта схема определяет точные права доступа для каждой роли в системе.
 * Все пересечения и зависимости должны быть устранены.
 */

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

export interface RoleAccess {
  // Основные права
  canAccessAdminPanel: boolean;
  canSeeAdminTile: boolean;
  canSeeAdminButton: boolean;
  
  // Управление пользователями
  canManageUsers: boolean;
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canViewAllUsers: boolean;
  
  // Управление ролями
  canManageRoles: boolean;
  canCreateRoles: boolean;
  canEditRoles: boolean;
  canDeleteRoles: boolean;
  
  // Системные настройки
  canManageSystemSettings: boolean;
  canManageDatabase: boolean;
  canManageNotifications: boolean;
  canManageTenant: boolean;
  
  // Функциональные возможности
  canManagePartners: boolean;
  canViewAnalytics: boolean;
  canViewAudit: boolean;
  canManageFiles: boolean;
  canManageFinance: boolean;
  canSignDocuments: boolean;
  
  // Навигация и интерфейс
  canSeeScannerButton: boolean;
  canSeeSearchHeader: boolean;
  canAcceptShipments: boolean;
  canManageChat: boolean;
  canViewAllShipments: boolean;
  canManageShipments: boolean;
  canTransitionShipments: boolean;
  canDownloadCleanFiles: boolean;
  canViewFinance: boolean;
}

/**
 * ЧЕТКАЯ СХЕМА ДОСТУПА ДЛЯ КАЖДОЙ РОЛИ
 */
export const ROLE_ACCESS_SCHEMA: Record<UserRole, RoleAccess> = {
  SUPER_ADMIN: {
    // Основные права - ВСЕ РАЗРЕШЕНЫ
    canAccessAdminPanel: true,
    canSeeAdminTile: true,
    canSeeAdminButton: true,
    
    // Управление пользователями - ВСЕ РАЗРЕШЕНЫ
    canManageUsers: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canViewAllUsers: true,
    
    // Управление ролями - ВСЕ РАЗРЕШЕНЫ
    canManageRoles: true,
    canCreateRoles: true,
    canEditRoles: true,
    canDeleteRoles: true,
    
    // Системные настройки - ВСЕ РАЗРЕШЕНЫ
    canManageSystemSettings: true,
    canManageDatabase: true,
    canManageNotifications: true,
    canManageTenant: true,
    
    // Функциональные возможности - ВСЕ РАЗРЕШЕНЫ
    canManagePartners: true,
    canViewAnalytics: true,
    canViewAudit: true,
    canManageFiles: true,
    canManageFinance: true,
    canSignDocuments: true,
    
    // Навигация и интерфейс - ВСЕ РАЗРЕШЕНЫ
    canSeeScannerButton: true,
    canSeeSearchHeader: true,
    canAcceptShipments: true,
    canManageChat: true,
    canViewAllShipments: true,
    canManageShipments: true,
    canTransitionShipments: true,
    canDownloadCleanFiles: true,
    canViewFinance: true,
  },
  
  ADMIN: {
    // Основные права - ЗАПРЕЩЕНЫ
    canAccessAdminPanel: false,
    canSeeAdminTile: false,
    canSeeAdminButton: false,
    
    // Управление пользователями - ЗАПРЕЩЕНЫ
    canManageUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewAllUsers: false,
    
    // Управление ролями - ЗАПРЕЩЕНЫ
    canManageRoles: false,
    canCreateRoles: false,
    canEditRoles: false,
    canDeleteRoles: false,
    
    // Системные настройки - ЗАПРЕЩЕНЫ
    canManageSystemSettings: false,
    canManageDatabase: false,
    canManageNotifications: false,
    canManageTenant: false,
    
    // Функциональные возможности - РАЗРЕШЕНЫ
    canManagePartners: true,
    canViewAnalytics: true,
    canViewAudit: true,
    canManageFiles: true,
    canManageFinance: false, // Только SUPER_ADMIN
    canSignDocuments: true,
    
    // Навигация и интерфейс - РАЗРЕШЕНЫ
    canSeeScannerButton: true,
    canSeeSearchHeader: true,
    canAcceptShipments: true,
    canManageChat: true,
    canViewAllShipments: true,
    canManageShipments: true,
    canTransitionShipments: true,
    canDownloadCleanFiles: true,
    canViewFinance: true,
  },
  
  USER: {
    // Основные права - ЗАПРЕЩЕНЫ
    canAccessAdminPanel: false,
    canSeeAdminTile: false,
    canSeeAdminButton: false,
    
    // Управление пользователями - ЗАПРЕЩЕНЫ
    canManageUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewAllUsers: false,
    
    // Управление ролями - ЗАПРЕЩЕНЫ
    canManageRoles: false,
    canCreateRoles: false,
    canEditRoles: false,
    canDeleteRoles: false,
    
    // Системные настройки - ЗАПРЕЩЕНЫ
    canManageSystemSettings: false,
    canManageDatabase: false,
    canManageNotifications: false,
    canManageTenant: false,
    
    // Функциональные возможности - ОГРАНИЧЕНЫ
    canManagePartners: false,
    canViewAnalytics: false,
    canViewAudit: false,
    canManageFiles: false,
    canManageFinance: false,
    canSignDocuments: false,
    
    // Навигация и интерфейс - ОГРАНИЧЕНЫ
    canSeeScannerButton: false,
    canSeeSearchHeader: false,
    canAcceptShipments: false,
    canManageChat: false,
    canViewAllShipments: false,
    canManageShipments: false,
    canTransitionShipments: false,
    canDownloadCleanFiles: false,
    canViewFinance: false,
  },
};

/**
 * Функция для получения прав доступа роли
 */
export function getRoleAccess(role: UserRole): RoleAccess {
  return ROLE_ACCESS_SCHEMA[role];
}

/**
 * Функция для проверки конкретного права доступа
 */
export function hasAccess(role: UserRole, permission: keyof RoleAccess): boolean {
  return ROLE_ACCESS_SCHEMA[role][permission];
}

/**
 * Функция для получения всех разрешенных действий для роли
 */
export function getAllowedActions(role: UserRole): string[] {
  const access = ROLE_ACCESS_SCHEMA[role];
  return Object.entries(access)
    .filter(([_, allowed]) => allowed)
    .map(([action, _]) => action);
}

/**
 * Функция для получения всех запрещенных действий для роли
 */
export function getForbiddenActions(role: UserRole): string[] {
  const access = ROLE_ACCESS_SCHEMA[role];
  return Object.entries(access)
    .filter(([_, allowed]) => !allowed)
    .map(([action, _]) => action);
}
