/**
 * СИСТЕМА ABAC (Attribute-Based Access Control)
 * 
 * Контроль доступа на основе атрибутов пользователя, ресурса и контекста
 * Позволяет создавать сложные правила доступа
 */

export type UserAttribute = {
  role: string;
  department?: string;
  location?: string;
  clearance_level?: number;
  is_active: boolean;
  created_at: Date;
  last_login?: Date;
};

export type ResourceAttribute = {
  type: string;
  owner?: string;
  department?: string;
  classification?: 'public' | 'internal' | 'confidential' | 'secret';
  created_at: Date;
  modified_at: Date;
};

export type ContextAttribute = {
  time: Date;
  location?: string;
  ip_address?: string;
  device_type?: string;
  session_duration?: number;
};

export type AccessRule = {
  id: string;
  name: string;
  description: string;
  conditions: {
    user?: Partial<UserAttribute>;
    resource?: Partial<ResourceAttribute>;
    context?: Partial<ContextAttribute>;
  };
  action: 'allow' | 'deny';
  priority: number;
};

/**
 * СИСТЕМА ABAC С ПРАВИЛАМИ ДОСТУПА
 */
export class ABACSystem {
  private rules: AccessRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Инициализация правил по умолчанию
   */
  private initializeDefaultRules(): void {
    this.rules = [
      // Супер админ - полный доступ
      {
        id: 'super_admin_full_access',
        name: 'Супер админ - полный доступ',
        description: 'Супер администратор имеет доступ ко всем ресурсам',
        conditions: {
          user: { role: 'super_admin', is_active: true },
        },
        action: 'allow',
        priority: 1,
      },

      // Админ - доступ к управлению пользователями
      {
        id: 'admin_user_management',
        name: 'Админ - управление пользователями',
        description: 'Администратор может управлять пользователями',
        conditions: {
          user: { role: 'admin', is_active: true },
          resource: { type: 'user' },
        },
        action: 'allow',
        priority: 2,
      },

      // Менеджер - доступ к партнерам
      {
        id: 'manager_partners',
        name: 'Менеджер - партнеры',
        description: 'Менеджер может управлять партнерами',
        conditions: {
          user: { role: 'manager', is_active: true },
          resource: { type: 'partner' },
        },
        action: 'allow',
        priority: 3,
      },

      // Ограничение по времени
      {
        id: 'business_hours_only',
        name: 'Только рабочие часы',
        description: 'Доступ только в рабочие часы (9:00-18:00)',
        conditions: {
          context: {
            time: new Date(), // Будет проверяться динамически
          },
        },
        action: 'allow',
        priority: 10,
      },

      // Ограничение по отделу
      {
        id: 'department_access',
        name: 'Доступ по отделу',
        description: 'Пользователь может работать только с ресурсами своего отдела',
        conditions: {
          user: { department: 'sales' },
          resource: { department: 'sales' },
        },
        action: 'allow',
        priority: 5,
      },

      // Запрет доступа к конфиденциальным данным
      {
        id: 'no_confidential_access',
        name: 'Запрет конфиденциальных данных',
        description: 'Обычные пользователи не могут работать с конфиденциальными данными',
        conditions: {
          user: { role: 'user' },
          resource: { classification: 'confidential' },
        },
        action: 'deny',
        priority: 4,
      },
    ];
  }

  /**
   * Проверка доступа на основе атрибутов
   */
  checkAccess(
    user: UserAttribute,
    resource: ResourceAttribute,
    context: ContextAttribute
  ): boolean {
    // Сортируем правила по приоритету (меньший номер = выше приоритет)
    const sortedRules = [...this.rules].sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      if (this.matchesRule(user, resource, context, rule)) {
        return rule.action === 'allow';
      }
    }

    // По умолчанию запрещаем доступ
    return false;
  }

  /**
   * Проверка соответствия правилу
   */
  private matchesRule(
    user: UserAttribute,
    resource: ResourceAttribute,
    context: ContextAttribute,
    rule: AccessRule
  ): boolean {
    const { user: userConditions, resource: resourceConditions, context: contextConditions } = rule.conditions;

    // Проверяем условия пользователя
    if (userConditions && !this.matchesUserConditions(user, userConditions)) {
      return false;
    }

    // Проверяем условия ресурса
    if (resourceConditions && !this.matchesResourceConditions(resource, resourceConditions)) {
      return false;
    }

    // Проверяем условия контекста
    if (contextConditions && !this.matchesContextConditions(context, contextConditions)) {
      return false;
    }

    return true;
  }

  /**
   * Проверка условий пользователя
   */
  private matchesUserConditions(user: UserAttribute, conditions: Partial<UserAttribute>): boolean {
    return Object.entries(conditions).every(([key, value]) => {
      if (key === 'is_active' && typeof value === 'boolean') {
        return user.is_active === value;
      }
      if (key === 'role' && typeof value === 'string') {
        return user.role === value;
      }
      if (key === 'department' && typeof value === 'string') {
        return user.department === value;
      }
      if (key === 'clearance_level' && typeof value === 'number') {
        return (user.clearance_level || 0) >= value;
      }
      return true;
    });
  }

  /**
   * Проверка условий ресурса
   */
  private matchesResourceConditions(resource: ResourceAttribute, conditions: Partial<ResourceAttribute>): boolean {
    return Object.entries(conditions).every(([key, value]) => {
      if (key === 'type' && typeof value === 'string') {
        return resource.type === value;
      }
      if (key === 'classification' && typeof value === 'string') {
        return resource.classification === value;
      }
      if (key === 'department' && typeof value === 'string') {
        return resource.department === value;
      }
      return true;
    });
  }

  /**
   * Проверка условий контекста
   */
  private matchesContextConditions(context: ContextAttribute, conditions: Partial<ContextAttribute>): boolean {
    return Object.entries(conditions).every(([key, value]) => {
      if (key === 'time' && value instanceof Date) {
        const now = new Date();
        const hour = now.getHours();
        return hour >= 9 && hour <= 18; // Рабочие часы
      }
      if (key === 'location' && typeof value === 'string') {
        return context.location === value;
      }
      if (key === 'device_type' && typeof value === 'string') {
        return context.device_type === value;
      }
      return true;
    });
  }

  /**
   * Добавление нового правила
   */
  addRule(rule: AccessRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Удаление правила
   */
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }

  /**
   * Получение всех правил
   */
  getRules(): AccessRule[] {
    return [...this.rules];
  }
}

/**
 * ХУК ДЛЯ РАБОТЫ С ABAC
 */
export function useABAC() {
  const abac = new ABACSystem();

  return {
    checkAccess: (user: UserAttribute, resource: ResourceAttribute, context: ContextAttribute) =>
      abac.checkAccess(user, resource, context),
    addRule: (rule: AccessRule) => abac.addRule(rule),
    removeRule: (ruleId: string) => abac.removeRule(ruleId),
    getRules: () => abac.getRules(),
  };
}
