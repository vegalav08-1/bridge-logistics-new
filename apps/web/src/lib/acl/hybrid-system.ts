/**
 * ГИБРИДНАЯ СИСТЕМА С ДИНАМИЧЕСКИМИ РОЛЯМИ
 * 
 * Комбинирует RBAC, ABAC и динамические роли
 * Позволяет создавать сложные и гибкие системы доступа
 */

export type DynamicRole = {
  id: string;
  name: string;
  description: string;
  baseRole: string; // Базовая роль (super_admin, admin, user)
  permissions: string[];
  restrictions: string[];
  conditions: {
    time?: { start: string; end: string; days?: number[] };
    location?: string[];
    device?: string[];
    department?: string[];
  };
  isActive: boolean;
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
};

export type UserContext = {
  id: string;
  email: string;
  baseRole: string;
  dynamicRoles: string[];
  department: string;
  location: string;
  clearanceLevel: number;
  isActive: boolean;
  lastLogin: Date;
  sessionDuration: number;
  deviceType: string;
  ipAddress: string;
};

export type ResourceContext = {
  id: string;
  type: string;
  owner: string;
  department: string;
  classification: 'public' | 'internal' | 'confidential' | 'secret';
  tags: string[];
  createdBy: string;
  createdAt: Date;
  modifiedAt: Date;
};

/**
 * ГИБРИДНАЯ СИСТЕМА ДОСТУПА
 */
export class HybridAccessSystem {
  private dynamicRoles: Map<string, DynamicRole> = new Map();
  private accessRules: Map<string, any> = new Map();
  private auditLog: any[] = [];

  constructor() {
    this.initializeSystem();
  }

  /**
   * Инициализация системы
   */
  private initializeSystem(): void {
    // Создаем базовые динамические роли
    this.createDynamicRole({
      id: 'project_manager',
      name: 'Менеджер проекта',
      description: 'Управление проектами и командой',
      baseRole: 'admin',
      permissions: [
        'projects.view',
        'projects.create',
        'projects.edit',
        'projects.delete',
        'team.manage',
        'reports.view',
        'reports.create',
      ],
      restrictions: [
        'system.settings',
        'database.manage',
      ],
      conditions: {
        time: { start: '09:00', end: '18:00', days: [1, 2, 3, 4, 5] },
        department: ['development', 'marketing'],
      },
      isActive: true,
      createdBy: 'system',
      createdAt: new Date(),
    });

    this.createDynamicRole({
      id: 'financial_analyst',
      name: 'Финансовый аналитик',
      description: 'Анализ финансовых данных и отчетов',
      baseRole: 'user',
      permissions: [
        'finance.view',
        'finance.reports',
        'finance.export',
        'analytics.view',
        'reports.view',
      ],
      restrictions: [
        'users.manage',
        'system.settings',
      ],
      conditions: {
        time: { start: '08:00', end: '20:00', days: [1, 2, 3, 4, 5, 6] },
        department: ['finance', 'accounting'],
      },
      isActive: true,
      createdBy: 'system',
      createdAt: new Date(),
    });

    this.createDynamicRole({
      id: 'temporary_admin',
      name: 'Временный администратор',
      description: 'Временные права администратора',
      baseRole: 'admin',
      permissions: [
        'users.view',
        'users.edit',
        'partners.view',
        'partners.edit',
        'files.manage',
      ],
      restrictions: [
        'users.delete',
        'system.settings',
        'database.manage',
      ],
      conditions: {
        time: { start: '09:00', end: '17:00', days: [1, 2, 3, 4, 5] },
      },
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
      createdBy: 'system',
      createdAt: new Date(),
    });
  }

  /**
   * Создание динамической роли
   */
  createDynamicRole(role: DynamicRole): void {
    this.dynamicRoles.set(role.id, role);
    this.auditLog.push({
      action: 'create_dynamic_role',
      roleId: role.id,
      timestamp: new Date(),
      details: role,
    });
  }

  /**
   * Проверка доступа с учетом всех факторов
   */
  checkAccess(
    user: UserContext,
    resource: ResourceContext,
    action: string,
    context: {
      time: Date;
      location: string;
      device: string;
      ip: string;
    }
  ): boolean {
    // 1. Проверяем базовую роль
    const baseAccess = this.checkBaseRoleAccess(user.baseRole, action);
    if (!baseAccess) {
      this.logAccessAttempt(user, resource, action, false, 'Base role denied');
      return false;
    }

    // 2. Проверяем динамические роли
    const dynamicAccess = this.checkDynamicRoles(user, action, context);
    if (!dynamicAccess.allowed) {
      this.logAccessAttempt(user, resource, action, false, dynamicAccess.reason);
      return false;
    }

    // 3. Проверяем условия контекста
    const contextAccess = this.checkContextConditions(user, context);
    if (!contextAccess) {
      this.logAccessAttempt(user, resource, action, false, 'Context conditions not met');
      return false;
    }

    // 4. Проверяем ограничения ресурса
    const resourceAccess = this.checkResourceAccess(user, resource, action);
    if (!resourceAccess) {
      this.logAccessAttempt(user, resource, action, false, 'Resource access denied');
      return false;
    }

    this.logAccessAttempt(user, resource, action, true, 'Access granted');
    return true;
  }

  /**
   * Проверка базовой роли
   */
  private checkBaseRoleAccess(role: string, action: string): boolean {
    const basePermissions: Record<string, string[]> = {
      'super_admin': ['*'],
      'admin': [
        'users.view', 'users.edit', 'partners.view', 'partners.edit',
        'files.upload', 'files.download', 'finance.view'
      ],
      'user': [
        'files.upload', 'files.download', 'profile.edit'
      ],
    };

    const permissions = basePermissions[role] || [];
    return permissions.includes('*') || permissions.includes(action);
  }

  /**
   * Проверка динамических ролей
   */
  private checkDynamicRoles(
    user: UserContext,
    action: string,
    context: any
  ): { allowed: boolean; reason?: string } {
    for (const roleId of user.dynamicRoles) {
      const role = this.dynamicRoles.get(roleId);
      if (!role || !role.isActive) continue;

      // Проверяем срок действия
      if (role.expiresAt && role.expiresAt < new Date()) {
        continue;
      }

      // Проверяем разрешения
      if (role.permissions.includes(action)) {
        // Проверяем ограничения
        if (role.restrictions.includes(action)) {
          return { allowed: false, reason: 'Action restricted by dynamic role' };
        }

        // Проверяем условия времени
        if (role.conditions.time) {
          const now = new Date();
          const currentHour = now.getHours();
          const currentDay = now.getDay();
          const startHour = parseInt(role.conditions.time.start.split(':')[0]);
          const endHour = parseInt(role.conditions.time.end.split(':')[0]);
          const allowedDays = role.conditions.time.days || [1, 2, 3, 4, 5];

          if (currentHour < startHour || currentHour >= endHour) {
            continue;
          }

          if (!allowedDays.includes(currentDay)) {
            continue;
          }
        }

        // Проверяем условия отдела
        if (role.conditions.department && !role.conditions.department.includes(user.department)) {
          continue;
        }

        return { allowed: true };
      }
    }

    return { allowed: false, reason: 'No dynamic role grants access' };
  }

  /**
   * Проверка условий контекста
   */
  private checkContextConditions(user: UserContext, context: any): boolean {
    // Проверяем активность пользователя
    if (!user.isActive) return false;

    // Проверяем длительность сессии
    if (user.sessionDuration > 8 * 60 * 60 * 1000) { // 8 часов
      return false;
    }

    // Проверяем тип устройства
    if (context.device === 'mobile' && user.clearanceLevel < 3) {
      return false;
    }

    return true;
  }

  /**
   * Проверка доступа к ресурсу
   */
  private checkResourceAccess(user: UserContext, resource: ResourceContext, action: string): boolean {
    // Проверяем уровень доступа к ресурсу
    if (resource.classification === 'secret' && user.clearanceLevel < 4) {
      return false;
    }

    if (resource.classification === 'confidential' && user.clearanceLevel < 3) {
      return false;
    }

    // Проверяем принадлежность к отделу
    if (resource.department && resource.department !== user.department && user.baseRole !== 'super_admin') {
      return false;
    }

    return true;
  }

  /**
   * Логирование попыток доступа
   */
  private logAccessAttempt(
    user: UserContext,
    resource: ResourceContext,
    action: string,
    granted: boolean,
    reason: string
  ): void {
    this.auditLog.push({
      userId: user.id,
      resourceId: resource.id,
      action,
      granted,
      reason,
      timestamp: new Date(),
      userRole: user.baseRole,
      userDepartment: user.department,
      resourceType: resource.type,
      resourceClassification: resource.classification,
    });
  }

  /**
   * Получение всех динамических ролей
   */
  getDynamicRoles(): DynamicRole[] {
    return Array.from(this.dynamicRoles.values());
  }

  /**
   * Получение ролей пользователя
   */
  getUserRoles(userId: string): DynamicRole[] {
    // В реальной системе здесь был бы запрос к базе данных
    return [];
  }

  /**
   * Получение логов доступа
   */
  getAccessLogs(): any[] {
    return [...this.auditLog];
  }

  /**
   * Создание временной роли
   */
  createTemporaryRole(
    userId: string,
    permissions: string[],
    duration: number, // в часах
    createdBy: string
  ): string {
    const roleId = `temp_${userId}_${Date.now()}`;
    const role: DynamicRole = {
      id: roleId,
      name: `Временная роль для ${userId}`,
      description: 'Временная роль с ограниченным доступом',
      baseRole: 'user',
      permissions,
      restrictions: ['system.settings', 'database.manage'],
      conditions: {},
      isActive: true,
      expiresAt: new Date(Date.now() + duration * 60 * 60 * 1000),
      createdBy,
      createdAt: new Date(),
    };

    this.createDynamicRole(role);
    return roleId;
  }
}

/**
 * ХУК ДЛЯ РАБОТЫ С ГИБРИДНОЙ СИСТЕМОЙ
 */
export function useHybridAccess() {
  const system = new HybridAccessSystem();

  return {
    checkAccess: (
      user: UserContext,
      resource: ResourceContext,
      action: string,
      context: any
    ) => system.checkAccess(user, resource, action, context),
    
    createDynamicRole: (role: DynamicRole) => system.createDynamicRole(role),
    getDynamicRoles: () => system.getDynamicRoles(),
    getUserRoles: (userId: string) => system.getUserRoles(userId),
    getAccessLogs: () => system.getAccessLogs(),
    createTemporaryRole: (
      userId: string,
      permissions: string[],
      duration: number,
      createdBy: string
    ) => system.createTemporaryRole(userId, permissions, duration, createdBy),
  };
}
