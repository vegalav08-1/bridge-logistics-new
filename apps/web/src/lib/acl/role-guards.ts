// Централизованная система контроля доступа на основе ролей
// ИСПОЛЬЗУЕТ ЧЕТКУЮ СХЕМУ ДОСТУПА БЕЗ ПЕРЕСЕЧЕНИЙ

import { getRoleAccess, hasAccess as checkAccess, type UserRole } from './role-access-schema';

export type { UserRole };

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN' as const,
  ADMIN: 'ADMIN' as const,
  USER: 'USER' as const,
} as const;

// Функции проверки ролей
export const isSuperAdmin = (role: UserRole): boolean => role === ROLES.SUPER_ADMIN;
export const isAdmin = (role: UserRole): boolean => role === ROLES.ADMIN;
export const isUser = (role: UserRole): boolean => role === ROLES.USER;

// Функции проверки доступа - ИСПОЛЬЗУЮТ ЧЕТКУЮ СХЕМУ
export const canAccessAdminPanel = (role: UserRole): boolean => checkAccess(role, 'canAccessAdminPanel');
export const canManageUsers = (role: UserRole): boolean => checkAccess(role, 'canManageUsers');
export const canEditUsers = (role: UserRole): boolean => checkAccess(role, 'canEditUsers');
export const canDeleteUsers = (role: UserRole): boolean => checkAccess(role, 'canDeleteUsers');
export const canCreateUsers = (role: UserRole): boolean => checkAccess(role, 'canCreateUsers');
export const canViewAllUsers = (role: UserRole): boolean => checkAccess(role, 'canViewAllUsers');
export const canManagePartners = (role: UserRole): boolean => checkAccess(role, 'canManagePartners');
export const canViewAnalytics = (role: UserRole): boolean => checkAccess(role, 'canViewAnalytics');
export const canViewAudit = (role: UserRole): boolean => checkAccess(role, 'canViewAudit');
export const canManageDatabase = (role: UserRole): boolean => checkAccess(role, 'canManageDatabase');
export const canManageNotifications = (role: UserRole): boolean => checkAccess(role, 'canManageNotifications');
export const canManageTenant = (role: UserRole): boolean => checkAccess(role, 'canManageTenant');
export const canManageRoles = (role: UserRole): boolean => checkAccess(role, 'canManageRoles');
export const canManageSystemSettings = (role: UserRole): boolean => checkAccess(role, 'canManageSystemSettings');
export const canAccessAllFeatures = (role: UserRole): boolean => checkAccess(role, 'canAccessAdminPanel');

// Функции для API endpoints
export const canAccessAdminAPI = (role: UserRole): boolean => isSuperAdmin(role);
export const canAccessAdminUsersAPI = (role: UserRole): boolean => isSuperAdmin(role);
export const canAccessAdminPartnersAPI = (role: UserRole): boolean => isAdmin(role) || isSuperAdmin(role);
export const canAccessPackingAPI = (role: UserRole): boolean => isAdmin(role) || isSuperAdmin(role);
export const canAccessAnnotationsAPI = (role: UserRole): boolean => isAdmin(role) || isSuperAdmin(role);
export const canAccessAttachmentsAPI = (role: UserRole): boolean => isAdmin(role) || isSuperAdmin(role);

// Функции для навигации - ИСПОЛЬЗУЮТ ЧЕТКУЮ СХЕМУ
export const canSeeAdminButton = (role: UserRole): boolean => checkAccess(role, 'canSeeAdminButton');
export const canSeeAdminTile = (role: UserRole): boolean => checkAccess(role, 'canSeeAdminTile');
export const canSeeScannerButton = (role: UserRole): boolean => checkAccess(role, 'canSeeScannerButton');
export const canSeeSearchHeader = (role: UserRole): boolean => checkAccess(role, 'canSeeSearchHeader');

// Функции для чата - ИСПОЛЬЗУЮТ ЧЕТКУЮ СХЕМУ
export const canAcceptShipments = (role: UserRole): boolean => checkAccess(role, 'canAcceptShipments');
export const canManageChat = (role: UserRole): boolean => checkAccess(role, 'canManageChat');

// Функции для отгрузок - ИСПОЛЬЗУЮТ ЧЕТКУЮ СХЕМУ
export const canViewAllShipments = (role: UserRole): boolean => checkAccess(role, 'canViewAllShipments');
export const canManageShipments = (role: UserRole): boolean => checkAccess(role, 'canManageShipments');
export const canTransitionShipments = (role: UserRole): boolean => checkAccess(role, 'canTransitionShipments');

// Функции для файлов - ИСПОЛЬЗУЮТ ЧЕТКУЮ СХЕМУ
export const canDownloadCleanFiles = (role: UserRole): boolean => checkAccess(role, 'canDownloadCleanFiles');
export const canManageFiles = (role: UserRole): boolean => checkAccess(role, 'canManageFiles');

// Функции для финансов - ИСПОЛЬЗУЮТ ЧЕТКУЮ СХЕМУ
export const canViewFinance = (role: UserRole): boolean => checkAccess(role, 'canViewFinance');
export const canManageFinance = (role: UserRole): boolean => checkAccess(role, 'canManageFinance');

// Функции для документов - ИСПОЛЬЗУЮТ ЧЕТКУЮ СХЕМУ
export const canSignDocuments = (role: UserRole): boolean => checkAccess(role, 'canSignDocuments');

// Универсальная функция проверки доступа для массивов ролей
export const hasRoleAccess = (role: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(role);
};

// Функция для получения уровня доступа
export const getAccessLevel = (role: UserRole): number => {
  switch (role) {
    case ROLES.SUPER_ADMIN: return 3;
    case ROLES.ADMIN: return 2;
    case ROLES.USER: return 1;
    default: return 0;
  }
};

// Функция для проверки, может ли роль выполнять действие другой роли
export const canActAs = (userRole: UserRole, targetRole: UserRole): boolean => {
  const userLevel = getAccessLevel(userRole);
  const targetLevel = getAccessLevel(targetRole);
  return userLevel >= targetLevel;
};
