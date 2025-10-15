/**
 * СИСТЕМА С ГРАФАМИ РАЗРЕШЕНИЙ
 * 
 * Создает граф зависимостей между разрешениями
 * Позволяет наследовать и комбинировать права доступа
 */

export type PermissionNode = {
  id: string;
  name: string;
  description: string;
  type: 'action' | 'resource' | 'context';
  level: number;
  dependencies: string[];
  conflicts: string[];
  metadata: {
    category: string;
    risk: 'low' | 'medium' | 'high' | 'critical';
    requiresApproval: boolean;
  };
};

export type PermissionEdge = {
  from: string;
  to: string;
  type: 'requires' | 'excludes' | 'implies' | 'conflicts';
  weight: number;
  conditions?: {
    time?: string;
    location?: string;
    device?: string;
  };
};

export type PermissionGraph = {
  nodes: Map<string, PermissionNode>;
  edges: Map<string, PermissionEdge>;
  paths: Map<string, string[]>; // Кэш путей
};

/**
 * СИСТЕМА ГРАФОВ РАЗРЕШЕНИЙ
 */
export class PermissionGraphSystem {
  private graph: PermissionGraph;
  private userPermissions: Map<string, Set<string>> = new Map();
  private roleHierarchy: Map<string, string[]> = new Map();

  constructor() {
    this.graph = {
      nodes: new Map(),
      edges: new Map(),
      paths: new Map(),
    };
    this.initializeGraph();
  }

  /**
   * Инициализация графа разрешений
   */
  private initializeGraph(): void {
    // Создаем узлы разрешений
    this.addPermissionNode({
      id: 'admin.panel.access',
      name: 'Доступ к админ панели',
      description: 'Полный доступ к административной панели',
      type: 'action',
      level: 5,
      dependencies: [],
      conflicts: [],
      metadata: {
        category: 'administration',
        risk: 'critical',
        requiresApproval: true,
      },
    });

    this.addPermissionNode({
      id: 'users.manage',
      name: 'Управление пользователями',
      description: 'Создание, редактирование и удаление пользователей',
      type: 'action',
      level: 4,
      dependencies: ['users.view'],
      conflicts: [],
      metadata: {
        category: 'user_management',
        risk: 'high',
        requiresApproval: true,
      },
    });

    this.addPermissionNode({
      id: 'users.view',
      name: 'Просмотр пользователей',
      description: 'Просмотр списка пользователей и их данных',
      type: 'action',
      level: 2,
      dependencies: [],
      conflicts: [],
      metadata: {
        category: 'user_management',
        risk: 'medium',
        requiresApproval: false,
      },
    });

    this.addPermissionNode({
      id: 'files.upload',
      name: 'Загрузка файлов',
      description: 'Загрузка файлов в систему',
      type: 'action',
      level: 1,
      dependencies: [],
      conflicts: [],
      metadata: {
        category: 'file_management',
        risk: 'low',
        requiresApproval: false,
      },
    });

    this.addPermissionNode({
      id: 'finance.manage',
      name: 'Управление финансами',
      description: 'Полное управление финансовыми данными',
      type: 'action',
      level: 4,
      dependencies: ['finance.view'],
      conflicts: [],
      metadata: {
        category: 'finance',
        risk: 'critical',
        requiresApproval: true,
      },
    });

    // Создаем связи между разрешениями
    this.addPermissionEdge({
      from: 'admin.panel.access',
      to: 'users.manage',
      type: 'implies',
      weight: 1.0,
    });

    this.addPermissionEdge({
      from: 'users.manage',
      to: 'users.view',
      type: 'requires',
      weight: 1.0,
    });

    this.addPermissionEdge({
      from: 'admin.panel.access',
      to: 'finance.manage',
      type: 'implies',
      weight: 0.8,
    });

    this.addPermissionEdge({
      from: 'finance.manage',
      to: 'finance.view',
      type: 'requires',
      weight: 1.0,
    });

    // Создаем иерархию ролей
    this.roleHierarchy.set('super_admin', ['admin', 'user']);
    this.roleHierarchy.set('admin', ['user']);
    this.roleHierarchy.set('user', []);
  }

  /**
   * Добавление узла разрешения
   */
  addPermissionNode(node: PermissionNode): void {
    this.graph.nodes.set(node.id, node);
  }

  /**
   * Добавление связи между разрешениями
   */
  addPermissionEdge(edge: PermissionEdge): void {
    const edgeId = `${edge.from}_${edge.to}_${edge.type}`;
    this.graph.edges.set(edgeId, edge);
  }

  /**
   * Проверка доступа с учетом графа разрешений
   */
  checkPermissionAccess(
    userId: string,
    permission: string,
    context: {
      time: Date;
      location: string;
      device: string;
      ip: string;
    }
  ): boolean {
    const userPermissions = this.userPermissions.get(userId) || new Set();
    
    // Прямая проверка разрешения
    if (userPermissions.has(permission)) {
      return this.validatePermissionContext(permission, context);
    }

    // Проверка через граф зависимостей
    const accessiblePermissions = this.getAccessiblePermissions(userId);
    if (accessiblePermissions.has(permission)) {
      return this.validatePermissionContext(permission, context);
    }

    return false;
  }

  /**
   * Получение всех доступных разрешений для пользователя
   */
  getAccessiblePermissions(userId: string): Set<string> {
    const userPermissions = this.userPermissions.get(userId) || new Set();
    const accessiblePermissions = new Set<string>();

    // Добавляем прямые разрешения
    for (const permission of userPermissions) {
      accessiblePermissions.add(permission);
    }

    // Добавляем разрешения через граф зависимостей
    for (const permission of userPermissions) {
      const derivedPermissions = this.getDerivedPermissions(permission);
      for (const derived of derivedPermissions) {
        accessiblePermissions.add(derived);
      }
    }

    return accessiblePermissions;
  }

  /**
   * Получение производных разрешений
   */
  private getDerivedPermissions(permission: string): Set<string> {
    const derived = new Set<string>();
    const visited = new Set<string>();

    const traverse = (currentPermission: string) => {
      if (visited.has(currentPermission)) return;
      visited.add(currentPermission);

      for (const [edgeId, edge] of this.graph.edges) {
        if (edge.from === currentPermission) {
          if (edge.type === 'implies') {
            derived.add(edge.to);
            traverse(edge.to);
          }
        }
      }
    };

    traverse(permission);
    return derived;
  }

  /**
   * Валидация контекста разрешения
   */
  private validatePermissionContext(permission: string, context: any): boolean {
    const node = this.graph.nodes.get(permission);
    if (!node) return false;

    // Проверяем условия времени
    if (node.metadata.requiresApproval) {
      const now = new Date();
      const hour = now.getHours();
      if (hour < 9 || hour > 18) {
        return false; // Требует одобрения только в рабочие часы
      }
    }

    // Проверяем уровень риска
    if (node.metadata.risk === 'critical') {
      // Дополнительные проверки для критических разрешений
      if (context.device === 'mobile') {
        return false;
      }
    }

    return true;
  }

  /**
   * Назначение разрешений пользователю
   */
  assignPermissions(userId: string, permissions: string[]): void {
    const userPermissions = this.userPermissions.get(userId) || new Set();
    for (const permission of permissions) {
      userPermissions.add(permission);
    }
    this.userPermissions.set(userId, userPermissions);
  }

  /**
   * Создание роли с разрешениями
   */
  createRole(roleId: string, permissions: string[]): void {
    // В реальной системе здесь была бы работа с базой данных
    console.log(`Creating role ${roleId} with permissions:`, permissions);
  }

  /**
   * Получение пути между разрешениями
   */
  getPermissionPath(from: string, to: string): string[] {
    const pathKey = `${from}_${to}`;
    if (this.graph.paths.has(pathKey)) {
      return this.graph.paths.get(pathKey)!;
    }

    const path = this.findShortestPath(from, to);
    this.graph.paths.set(pathKey, path);
    return path;
  }

  /**
   * Поиск кратчайшего пути между разрешениями
   */
  private findShortestPath(from: string, to: string): string[] {
    const queue: string[] = [from];
    const visited = new Set<string>();
    const parent = new Map<string, string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === to) {
        const path: string[] = [];
        let node = to;
        while (node) {
          path.unshift(node);
          node = parent.get(node)!;
        }
        return path;
      }

      if (visited.has(current)) continue;
      visited.add(current);

      for (const [edgeId, edge] of this.graph.edges) {
        if (edge.from === current && !visited.has(edge.to)) {
          parent.set(edge.to, current);
          queue.push(edge.to);
        }
      }
    }

    return [];
  }

  /**
   * Получение статистики разрешений
   */
  getPermissionStats(): {
    totalPermissions: number;
    totalEdges: number;
    riskDistribution: Record<string, number>;
    categoryDistribution: Record<string, number>;
  } {
    const stats = {
      totalPermissions: this.graph.nodes.size,
      totalEdges: this.graph.edges.size,
      riskDistribution: {} as Record<string, number>,
      categoryDistribution: {} as Record<string, number>,
    };

    for (const [id, node] of this.graph.nodes) {
      // Распределение по рискам
      const risk = node.metadata.risk;
      stats.riskDistribution[risk] = (stats.riskDistribution[risk] || 0) + 1;

      // Распределение по категориям
      const category = node.metadata.category;
      stats.categoryDistribution[category] = (stats.categoryDistribution[category] || 0) + 1;
    }

    return stats;
  }
}

/**
 * ХУК ДЛЯ РАБОТЫ С ГРАФОМ РАЗРЕШЕНИЙ
 */
export function usePermissionGraph() {
  const system = new PermissionGraphSystem();

  return {
    checkPermissionAccess: (
      userId: string,
      permission: string,
      context: any
    ) => system.checkPermissionAccess(userId, permission, context),
    
    getAccessiblePermissions: (userId: string) => system.getAccessiblePermissions(userId),
    assignPermissions: (userId: string, permissions: string[]) => system.assignPermissions(userId, permissions),
    createRole: (roleId: string, permissions: string[]) => system.createRole(roleId, permissions),
    getPermissionPath: (from: string, to: string) => system.getPermissionPath(from, to),
    getPermissionStats: () => system.getPermissionStats(),
  };
}
