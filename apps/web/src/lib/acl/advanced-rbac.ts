/**
 * ПРОДВИНУТАЯ СИСТЕМА RBAC С НЕЗАВИСИМЫМИ СВЯЗЯМИ
 * 
 * Каждая роль имеет независимые связи с функциями и разделами
 * Позволяет создавать гибкие комбинации прав доступа
 */

export type Permission = 
  // Админ панель
  | 'admin.panel.access'
  | 'admin.panel.view'
  | 'admin.panel.manage'
  
  // Пользователи
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.manage_roles'
  
  // Роли
  | 'roles.view'
  | 'roles.create'
  | 'roles.edit'
  | 'roles.delete'
  | 'roles.assign'
  
  // Партнеры
  | 'partners.view'
  | 'partners.create'
  | 'partners.edit'
  | 'partners.delete'
  
  // Файлы
  | 'files.view'
  | 'files.upload'
  | 'files.download'
  | 'files.delete'
  
  // Финансы
  | 'finance.view'
  | 'finance.manage'
  | 'finance.reports'
  
  // Система
  | 'system.settings'
  | 'system.database'
  | 'system.notifications'
  | 'system.tenant';

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  metadata?: {
    color?: string;
    icon?: string;
    priority?: number;
  };
};

export type User = {
  id: string;
  email: string;
  role: string;
  additionalPermissions?: Permission[];
  restrictions?: Permission[];
};

/**
 * СИСТЕМА РОЛЕЙ С НЕЗАВИСИМЫМИ СВЯЗЯМИ
 */
export const SYSTEM_ROLES: Record<string, Role> = {
  'super_admin': {
    id: 'super_admin',
    name: 'Супер Администратор',
    description: 'Полный доступ ко всем функциям системы',
    isSystem: true,
    permissions: [
      'admin.panel.access',
      'admin.panel.view',
      'admin.panel.manage',
      'users.view',
      'users.create',
      'users.edit',
      'users.delete',
      'users.manage_roles',
      'roles.view',
      'roles.create',
      'roles.edit',
      'roles.delete',
      'roles.assign',
      'partners.view',
      'partners.create',
      'partners.edit',
      'partners.delete',
      'files.view',
      'files.upload',
      'files.download',
      'files.delete',
      'finance.view',
      'finance.manage',
      'finance.reports',
      'system.settings',
      'system.database',
      'system.notifications',
      'system.tenant',
    ],
    metadata: {
      color: '#dc2626',
      icon: 'shield',
      priority: 1,
    },
  },
  
  'admin': {
    id: 'admin',
    name: 'Администратор',
    description: 'Управление пользователями и основными функциями',
    isSystem: false,
    permissions: [
      'users.view',
      'users.create',
      'users.edit',
      'partners.view',
      'partners.create',
      'partners.edit',
      'files.view',
      'files.upload',
      'files.download',
      'finance.view',
    ],
    metadata: {
      color: '#2563eb',
      icon: 'user-cog',
      priority: 2,
    },
  },
  
  'manager': {
    id: 'manager',
    name: 'Менеджер',
    description: 'Управление партнерами и файлами',
    isSystem: false,
    permissions: [
      'partners.view',
      'partners.create',
      'partners.edit',
      'files.view',
      'files.upload',
      'files.download',
      'finance.view',
    ],
    metadata: {
      color: '#059669',
      icon: 'users',
      priority: 3,
    },
  },
  
  'user': {
    id: 'user',
    name: 'Пользователь',
    description: 'Базовый доступ к системе',
    isSystem: false,
    permissions: [
      'files.view',
      'files.upload',
    ],
    metadata: {
      color: '#6b7280',
      icon: 'user',
      priority: 4,
    },
  },
};

/**
 * ФУНКЦИИ ПРОВЕРКИ ДОСТУПА
 */
export class PermissionChecker {
  private user: User;
  private role: Role;

  constructor(user: User) {
    this.user = user;
    this.role = SYSTEM_ROLES[user.role];
  }

  /**
   * Проверяет наличие конкретного разрешения
   */
  hasPermission(permission: Permission): boolean {
    // Проверяем ограничения
    if (this.user.restrictions?.includes(permission)) {
      return false;
    }

    // Проверяем дополнительные разрешения
    if (this.user.additionalPermissions?.includes(permission)) {
      return true;
    }

    // Проверяем разрешения роли
    return this.role.permissions.includes(permission);
  }

  /**
   * Проверяет наличие любого из разрешений
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Проверяет наличие всех разрешений
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Получает все доступные разрешения пользователя
   */
  getAvailablePermissions(): Permission[] {
    const rolePermissions = this.role.permissions;
    const additionalPermissions = this.user.additionalPermissions || [];
    const restrictions = this.user.restrictions || [];

    return [
      ...rolePermissions,
      ...additionalPermissions,
    ].filter(permission => !restrictions.includes(permission));
  }

  /**
   * Проверяет доступ к разделу
   */
  canAccessSection(section: string): boolean {
    const sectionPermissions: Record<string, Permission[]> = {
      'admin': ['admin.panel.access'],
      'users': ['users.view'],
      'roles': ['roles.view'],
      'partners': ['partners.view'],
      'files': ['files.view'],
      'finance': ['finance.view'],
      'system': ['system.settings'],
    };

    const requiredPermissions = sectionPermissions[section] || [];
    return this.hasAnyPermission(requiredPermissions);
  }
}

/**
 * ХУК ДЛЯ РАБОТЫ С РАЗРЕШЕНИЯМИ
 */
export function usePermissions(user: User) {
  const checker = new PermissionChecker(user);

  return {
    hasPermission: (permission: Permission) => checker.hasPermission(permission),
    hasAnyPermission: (permissions: Permission[]) => checker.hasAnyPermission(permissions),
    hasAllPermissions: (permissions: Permission[]) => checker.hasAllPermissions(permissions),
    canAccessSection: (section: string) => checker.canAccessSection(section),
    getAvailablePermissions: () => checker.getAvailablePermissions(),
  };
}
