import { z } from 'zod';

// Схема для роли пользователя
export const UserRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  permissions: z.array(z.string()),
  tags: z.array(z.string()), // ACL теги для фильтрации
});

export type UserRole = z.infer<typeof UserRoleSchema>;

// Схема для пользователя
export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: UserRoleSchema,
  partnerId: z.string().optional(), // для партнёров
  adminId: z.string().optional(), // для админов
});

export type User = z.infer<typeof UserSchema>;

// Схема для ACL контекста
export const ACLContextSchema = z.object({
  userId: z.string(),
  userRole: z.string(),
  userTags: z.array(z.string()),
  partnerId: z.string().optional(),
  adminId: z.string().optional(),
  permissions: z.array(z.string()),
});

export type ACLContext = z.infer<typeof ACLContextSchema>;

// Схема для ACL фильтра
export const ACLFilterSchema = z.object({
  roles: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  partnerId: z.string().optional(),
  adminId: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export type ACLFilter = z.infer<typeof ACLFilterSchema>;

// Схема для ACL правила
export const ACLRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['eq', 'ne', 'in', 'nin', 'contains', 'exists']),
    value: z.any(),
  })),
  actions: z.array(z.enum(['allow', 'deny', 'filter'])),
  priority: z.number().default(0),
});

export type ACLRule = z.infer<typeof ACLRuleSchema>;

// Схема для ACL политики
export const ACLPolicySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  rules: z.array(ACLRuleSchema),
  defaultAction: z.enum(['allow', 'deny']).default('deny'),
});

export type ACLPolicy = z.infer<typeof ACLPolicySchema>;

// Схема для ACL результата
export const ACLResultSchema = z.object({
  allowed: z.boolean(),
  filtered: z.boolean(),
  filters: z.array(z.string()).optional(),
  reason: z.string().optional(),
  appliedRules: z.array(z.string()).optional(),
});

export type ACLResult = z.infer<typeof ACLResultSchema>;

// Класс для работы с ACL
export class ACLManager {
  private policies: Map<string, ACLPolicy> = new Map();
  private rules: Map<string, ACLRule> = new Map();

  constructor() {
    this.initializeDefaultPolicies();
  }

  // Инициализация политик по умолчанию
  private initializeDefaultPolicies() {
    // Политика для супер-админов
    const superAdminPolicy: ACLPolicy = {
      id: 'super-admin',
      name: 'Super Admin Policy',
      description: 'Полный доступ для супер-админов',
      rules: [
        {
          id: 'super-admin-rule',
          name: 'Super Admin Access',
          conditions: [
            { field: 'userRole', operator: 'eq', value: 'super-admin' },
          ],
          actions: ['allow'],
          priority: 100,
        },
      ],
      defaultAction: 'allow',
    };

    // Политика для партнёрских админов
    const partnerAdminPolicy: ACLPolicy = {
      id: 'partner-admin',
      name: 'Partner Admin Policy',
      description: 'Доступ для партнёрских админов',
      rules: [
        {
          id: 'partner-admin-rule',
          name: 'Partner Admin Access',
          conditions: [
            { field: 'userRole', operator: 'eq', value: 'partner-admin' },
          ],
          actions: ['allow'],
          priority: 90,
        },
      ],
      defaultAction: 'deny',
    };

    // Политика для пользователей
    const userPolicy: ACLPolicy = {
      id: 'user',
      name: 'User Policy',
      description: 'Ограниченный доступ для пользователей',
      rules: [
        {
          id: 'user-rule',
          name: 'User Access',
          conditions: [
            { field: 'userRole', operator: 'eq', value: 'user' },
          ],
          actions: ['filter'],
          priority: 80,
        },
      ],
      defaultAction: 'deny',
    };

    this.addPolicy(superAdminPolicy);
    this.addPolicy(partnerAdminPolicy);
    this.addPolicy(userPolicy);
  }

  // Добавить политику
  addPolicy(policy: ACLPolicy): void {
    this.policies.set(policy.id, policy);
    policy.rules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  // Удалить политику
  removePolicy(policyId: string): void {
    const policy = this.policies.get(policyId);
    if (policy) {
      policy.rules.forEach(rule => {
        this.rules.delete(rule.id);
      });
      this.policies.delete(policyId);
    }
  }

  // Получить политику
  getPolicy(policyId: string): ACLPolicy | undefined {
    return this.policies.get(policyId);
  }

  // Получить все политики
  getAllPolicies(): ACLPolicy[] {
    return Array.from(this.policies.values());
  }

  // Проверить доступ
  checkAccess(context: ACLContext, resource: any): ACLResult {
    const applicablePolicies = this.getApplicablePolicies(context);
    
    for (const policy of applicablePolicies) {
      const result = this.evaluatePolicy(policy, context, resource);
      if (result.allowed || result.filtered) {
        return result;
      }
    }

    // Если ни одна политика не применилась, используем действие по умолчанию
    const defaultPolicy = this.getDefaultPolicy(context);
    if (defaultPolicy) {
      return this.evaluatePolicy(defaultPolicy, context, resource);
    }

    return {
      allowed: false,
      filtered: false,
      reason: 'No applicable policy found',
    };
  }

  // Получить применимые политики
  private getApplicablePolicies(context: ACLContext): ACLPolicy[] {
    const applicablePolicies: ACLPolicy[] = [];

    for (const policy of this.policies.values()) {
      if (this.isPolicyApplicable(policy, context)) {
        applicablePolicies.push(policy);
      }
    }

    // Сортируем по приоритету (высокий приоритет первым)
    return applicablePolicies.sort((a, b) => {
      const aMaxPriority = Math.max(...a.rules.map(r => r.priority));
      const bMaxPriority = Math.max(...b.rules.map(r => r.priority));
      return bMaxPriority - aMaxPriority;
    });
  }

  // Проверить, применима ли политика
  private isPolicyApplicable(policy: ACLPolicy, context: ACLContext): boolean {
    for (const rule of policy.rules) {
      if (this.evaluateRule(rule, context)) {
        return true;
      }
    }
    return false;
  }

  // Получить политику по умолчанию
  private getDefaultPolicy(context: ACLContext): ACLPolicy | null {
    // Ищем политику с действием по умолчанию
    for (const policy of this.policies.values()) {
      if (policy.defaultAction === 'allow' || policy.defaultAction === 'deny') {
        return policy;
      }
    }
    return null;
  }

  // Оценить политику
  private evaluatePolicy(policy: ACLPolicy, context: ACLContext, resource: any): ACLResult {
    const applicableRules = policy.rules
      .filter(rule => this.evaluateRule(rule, context))
      .sort((a, b) => b.priority - a.priority);

    if (applicableRules.length === 0) {
      return {
        allowed: policy.defaultAction === 'allow',
        filtered: false,
        reason: `No applicable rules in policy ${policy.name}`,
      };
    }

    const rule = applicableRules[0];
    const actions = rule.actions;

    if (actions.includes('allow')) {
      return {
        allowed: true,
        filtered: false,
        reason: `Allowed by rule ${rule.name}`,
        appliedRules: [rule.id],
      };
    }

    if (actions.includes('deny')) {
      return {
        allowed: false,
        filtered: false,
        reason: `Denied by rule ${rule.name}`,
        appliedRules: [rule.id],
      };
    }

    if (actions.includes('filter')) {
      const filters = this.generateFilters(rule, context, resource);
      return {
        allowed: true,
        filtered: true,
        filters,
        reason: `Filtered by rule ${rule.name}`,
        appliedRules: [rule.id],
      };
    }

    return {
      allowed: policy.defaultAction === 'allow',
      filtered: false,
      reason: `No action specified in rule ${rule.name}`,
    };
  }

  // Оценить правило
  private evaluateRule(rule: ACLRule, context: ACLContext): boolean {
    for (const condition of rule.conditions) {
      if (!this.evaluateCondition(condition, context)) {
        return false;
      }
    }
    return true;
  }

  // Оценить условие
  private evaluateCondition(condition: any, context: ACLContext): boolean {
    const fieldValue = this.getFieldValue(condition.field, context);
    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'eq':
        return fieldValue === conditionValue;
      case 'ne':
        return fieldValue !== conditionValue;
      case 'in':
        return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
      case 'nin':
        return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue);
      case 'contains':
        return Array.isArray(fieldValue) && fieldValue.includes(conditionValue);
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
      default:
        return false;
    }
  }

  // Получить значение поля
  private getFieldValue(field: string, context: ACLContext): any {
    const fieldMap: Record<string, any> = {
      userId: context.userId,
      userRole: context.userRole,
      userTags: context.userTags,
      partnerId: context.partnerId,
      adminId: context.adminId,
      permissions: context.permissions,
    };

    return fieldMap[field];
  }

  // Сгенерировать фильтры
  private generateFilters(rule: ACLRule, context: ACLContext, resource: any): string[] {
    const filters: string[] = [];

    // Добавляем фильтры на основе контекста пользователя
    if (context.partnerId) {
      filters.push(`partnerId = ${context.partnerId}`);
    }

    if (context.adminId) {
      filters.push(`adminId = ${context.adminId}`);
    }

    // Добавляем фильтры на основе тегов
    if (context.userTags.length > 0) {
      const tagFilters = context.userTags.map(tag => `roles = ${tag}`);
      filters.push(`(${tagFilters.join(' OR ')})`);
    }

    // Добавляем фильтры на основе роли
    if (context.userRole !== 'super-admin') {
      filters.push(`roles = ${context.userRole}`);
    }

    return filters;
  }

  // Создать контекст из пользователя
  createContext(user: User): ACLContext {
    return {
      userId: user.id,
      userRole: user.role.name,
      userTags: user.role.tags,
      partnerId: user.partnerId,
      adminId: user.adminId,
      permissions: user.role.permissions,
    };
  }

  // Создать фильтр для поиска
  createSearchFilter(context: ACLContext): string[] {
    const filters: string[] = [];

    // Добавляем фильтры на основе контекста
    if (context.partnerId) {
      filters.push(`partnerId = ${context.partnerId}`);
    }

    if (context.adminId) {
      filters.push(`adminId = ${context.adminId}`);
    }

    // Добавляем фильтры на основе тегов
    if (context.userTags.length > 0) {
      const tagFilters = context.userTags.map(tag => `roles = ${tag}`);
      filters.push(`(${tagFilters.join(' OR ')})`);
    }

    // Добавляем фильтры на основе роли
    if (context.userRole !== 'super-admin') {
      filters.push(`roles = ${context.userRole}`);
    }

    return filters;
  }

  // Проверить разрешение
  hasPermission(context: ACLContext, permission: string): boolean {
    return context.permissions.includes(permission);
  }

  // Проверить роль
  hasRole(context: ACLContext, role: string): boolean {
    return context.userRole === role;
  }

  // Проверить тег
  hasTag(context: ACLContext, tag: string): boolean {
    return context.userTags.includes(tag);
  }
}

// Экспорт экземпляра по умолчанию
export const aclManager = new ACLManager();

// Утилиты для работы с ACL
export function createACLContext(user: User): ACLContext {
  return aclManager.createContext(user);
}

export function checkACLAccess(context: ACLContext, resource: any): ACLResult {
  return aclManager.checkAccess(context, resource);
}

export function createACLFilter(context: ACLContext): string[] {
  return aclManager.createSearchFilter(context);
}

export function hasACLPermission(context: ACLContext, permission: string): boolean {
  return aclManager.hasPermission(context, permission);
}

export function hasACLRole(context: ACLContext, role: string): boolean {
  return aclManager.hasRole(context, role);
}

export function hasACLTag(context: ACLContext, tag: string): boolean {
  return aclManager.hasTag(context, tag);
}







