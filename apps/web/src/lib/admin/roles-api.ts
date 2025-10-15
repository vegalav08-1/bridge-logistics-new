// API для управления ролями в административной панели

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  metadata?: {
    color?: string;
    icon?: string;
    priority?: number;
  };
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
  isSystem: boolean;
  dependencies?: string[];
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
  metadata?: {
    color?: string;
    icon?: string;
    priority?: number;
  };
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
  metadata?: {
    color?: string;
    icon?: string;
    priority?: number;
  };
}

// Исходные системные роли
const initialSystemRoles: Role[] = [
  {
    id: 'super_admin',
    name: 'SUPER_ADMIN',
    description: 'Супер-администратор с полными правами доступа',
    permissions: ['*'],
    userCount: 1,
    isSystem: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    metadata: {
      color: '#dc2626',
      icon: 'Shield',
      priority: 1
    }
  },
  {
    id: 'admin',
    name: 'ADMIN',
    description: 'Администратор с расширенными правами',
    permissions: [
      'shipment:view', 'shipment:create', 'shipment:edit', 'shipment:delete',
      'user:view', 'user:create', 'user:edit',
      'partner:view', 'partner:create', 'partner:edit', 'partner:delete',
      'finance:view', 'finance:create', 'finance:edit',
      'audit:view', 'analytics:view'
    ],
    userCount: 2,
    isSystem: false, // Сделали редактируемой
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    metadata: {
      color: '#2563eb',
      icon: 'Users',
      priority: 2
    }
  },
  {
    id: 'user',
    name: 'USER',
    description: 'Обычный пользователь с базовыми правами',
    permissions: [
      'shipment:view', 'request:create',
      'finance:pay'
    ],
    userCount: 5,
    isSystem: false, // Сделали редактируемой
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    metadata: {
      color: '#16a34a',
      icon: 'User',
      priority: 3
    }
  }
];

// Пользовательские роли
let customRoles: Role[] = [
  {
    id: 'manager',
    name: 'MANAGER',
    description: 'Менеджер с правами управления отгрузками',
    permissions: [
      'shipment:view', 'shipment:create', 'shipment:edit',
      'user:view', 'partner:view', 'partner:create', 'partner:edit',
      'finance:view'
    ],
    userCount: 3,
    isSystem: false,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    metadata: {
      color: '#7c3aed',
      icon: 'Settings',
      priority: 4
    }
  },
  {
    id: 'viewer',
    name: 'VIEWER',
    description: 'Пользователь только для просмотра',
    permissions: [
      'shipment:view', 'user:view', 'partner:view', 'finance:view'
    ],
    userCount: 1,
    isSystem: false,
    isActive: true,
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    metadata: {
      color: '#ea580c',
      icon: 'Eye',
      priority: 5
    }
  }
];

// Все роли
let allRoles: Role[] = [...initialSystemRoles, ...customRoles];

// Функции для работы с localStorage
const loadRolesFromStorage = (): Role[] => {
  if (typeof window === 'undefined') return allRoles;
  
  try {
    const stored = localStorage.getItem('mockRoles');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('📦 Загружены роли из localStorage:', parsed.length);
      return parsed;
    }
  } catch (error) {
    console.error('Ошибка загрузки ролей из localStorage:', error);
  }
  
  return allRoles;
};

const saveRolesToStorage = (roles: Role[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('mockRoles', JSON.stringify(roles));
    console.log('💾 Роли сохранены в localStorage:', roles.length);
  } catch (error) {
    console.error('Ошибка сохранения ролей в localStorage:', error);
  }
};

// Инициализация данных
const initializeRolesData = () => {
  if (typeof window === 'undefined') return;
  
  const storedRoles = loadRolesFromStorage();
  if (storedRoles.length > 0) {
    allRoles = storedRoles;
  } else {
    saveRolesToStorage(allRoles);
  }
};

// Все доступные разрешения
export const allPermissions: Permission[] = [
  // Системные разрешения
  { id: 'system:admin', name: 'Админ панель', description: 'Доступ к административной панели', category: 'Система', resource: 'admin_area', action: 'manage', isSystem: true },
  { id: 'system:users', name: 'Управление пользователями', description: 'Создание, редактирование и удаление пользователей', category: 'Система', resource: 'user', action: 'manage', isSystem: true },
  { id: 'system:roles', name: 'Управление ролями', description: 'Создание, редактирование и удаление ролей', category: 'Система', resource: 'role', action: 'manage', isSystem: true },
  
  // Отгрузки
  { id: 'shipment:view', name: 'Просмотр отгрузок', description: 'Просмотр списка и деталей отгрузок', category: 'Отгрузки', resource: 'shipment', action: 'view', isSystem: false },
  { id: 'shipment:create', name: 'Создание отгрузок', description: 'Создание новых отгрузок', category: 'Отгрузки', resource: 'shipment', action: 'create', isSystem: false },
  { id: 'shipment:edit', name: 'Редактирование отгрузок', description: 'Изменение существующих отгрузок', category: 'Отгрузки', resource: 'shipment', action: 'update', isSystem: false },
  { id: 'shipment:delete', name: 'Удаление отгрузок', description: 'Удаление отгрузок', category: 'Отгрузки', resource: 'shipment', action: 'delete', isSystem: false },
  { id: 'shipment:transition', name: 'Изменение статуса', description: 'Изменение статуса отгрузок', category: 'Отгрузки', resource: 'shipment', action: 'transition', isSystem: false },
  
  // Пользователи
  { id: 'user:view', name: 'Просмотр пользователей', description: 'Просмотр списка пользователей', category: 'Пользователи', resource: 'user', action: 'view', isSystem: false },
  { id: 'user:create', name: 'Создание пользователей', description: 'Создание новых пользователей', category: 'Пользователи', resource: 'user', action: 'create', isSystem: false },
  { id: 'user:edit', name: 'Редактирование пользователей', description: 'Изменение данных пользователей', category: 'Пользователи', resource: 'user', action: 'update', isSystem: false },
  { id: 'user:delete', name: 'Удаление пользователей', description: 'Удаление пользователей', category: 'Пользователи', resource: 'user', action: 'delete', isSystem: false },
  
  // Партнеры
  { id: 'partner:view', name: 'Просмотр партнеров', description: 'Просмотр списка партнеров', category: 'Партнеры', resource: 'partner', action: 'view', isSystem: false },
  { id: 'partner:create', name: 'Создание партнеров', description: 'Создание новых партнеров', category: 'Партнеры', resource: 'partner', action: 'create', isSystem: false },
  { id: 'partner:edit', name: 'Редактирование партнеров', description: 'Изменение данных партнеров', category: 'Партнеры', resource: 'partner', action: 'update', isSystem: false },
  { id: 'partner:delete', name: 'Удаление партнеров', description: 'Удаление партнеров', category: 'Партнеры', resource: 'partner', action: 'delete', isSystem: false },
  
  // Финансы
  { id: 'finance:view', name: 'Просмотр финансов', description: 'Просмотр финансовых данных', category: 'Финансы', resource: 'finance', action: 'view', isSystem: false },
  { id: 'finance:create', name: 'Создание финансовых записей', description: 'Создание финансовых записей', category: 'Финансы', resource: 'finance', action: 'create', isSystem: false },
  { id: 'finance:edit', name: 'Редактирование финансов', description: 'Изменение финансовых данных', category: 'Финансы', resource: 'finance', action: 'update', isSystem: false },
  
  // Аналитика и аудит
  { id: 'analytics:view', name: 'Просмотр аналитики', description: 'Доступ к аналитическим данным', category: 'Аналитика', resource: 'analytics', action: 'view', isSystem: false },
  { id: 'audit:view', name: 'Просмотр аудита', description: 'Доступ к журналам аудита', category: 'Аудит', resource: 'audit', action: 'view', isSystem: false },
  
  // Файлы
  { id: 'file:download', name: 'Скачивание файлов', description: 'Скачивание файлов', category: 'Файлы', resource: 'file', action: 'download', isSystem: false },
  { id: 'file:upload', name: 'Загрузка файлов', description: 'Загрузка файлов', category: 'Файлы', resource: 'file', action: 'upload', isSystem: false },
  { id: 'file:delete', name: 'Удаление файлов', description: 'Удаление файлов', category: 'Файлы', resource: 'file', action: 'delete', isSystem: false },
  
  // Запросы
  { id: 'request:create', name: 'Создание запросов', description: 'Создание новых запросов', category: 'Запросы', resource: 'request', action: 'create', isSystem: false },
  { id: 'request:view', name: 'Просмотр запросов', description: 'Просмотр списка запросов', category: 'Запросы', resource: 'request', action: 'view', isSystem: false },
  { id: 'request:edit', name: 'Редактирование запросов', description: 'Изменение запросов', category: 'Запросы', resource: 'request', action: 'update', isSystem: false }
];

// API функции
export const rolesApi = {
  // Получить все роли
  async getRoles(): Promise<Role[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    initializeRolesData();
    return [...allRoles];
  },

  // Получить роль по ID
  async getRole(id: string): Promise<Role | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    initializeRolesData();
    return allRoles.find(role => role.id === id) || null;
  },

  // Создать новую роль
  async createRole(roleData: CreateRoleRequest): Promise<Role> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newRole: Role = {
      id: `role_${Date.now()}`,
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions,
      userCount: 0,
      isSystem: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: roleData.metadata
    };

    allRoles.push(newRole);
    saveRolesToStorage(allRoles);
    
    console.log('✅ Создана новая роль:', newRole.name);
    return newRole;
  },

  // Обновить роль
  async updateRole(id: string, roleData: UpdateRoleRequest): Promise<Role> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const roleIndex = allRoles.findIndex(role => role.id === id);
    if (roleIndex === -1) {
      throw new Error('Роль не найдена');
    }

    const updatedRole = {
      ...allRoles[roleIndex],
      ...roleData,
      updatedAt: new Date().toISOString()
    };

    allRoles[roleIndex] = updatedRole;
    saveRolesToStorage(allRoles);
    
    console.log('✅ Обновлена роль:', updatedRole.name);
    return updatedRole;
  },

  // Удалить роль
  async deleteRole(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const role = allRoles.find(r => r.id === id);
    if (!role) {
      throw new Error('Роль не найдена');
    }

    // Только SUPER_ADMIN нельзя удалять
    if (role.id === 'super_admin') {
      throw new Error('Роль SUPER_ADMIN нельзя удалять');
    }

    if (role.userCount > 0) {
      throw new Error('Нельзя удалить роль, которая используется пользователями');
    }

    allRoles = allRoles.filter(r => r.id !== id);
    saveRolesToStorage(allRoles);
    
    console.log('✅ Удалена роль:', role.name);
  },

  // Получить все разрешения
  async getPermissions(): Promise<Permission[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...allPermissions];
  },

  // Получить разрешения по категории
  async getPermissionsByCategory(): Promise<Record<string, Permission[]>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const permissionsByCategory: Record<string, Permission[]> = {};
    allPermissions.forEach(permission => {
      if (!permissionsByCategory[permission.category]) {
        permissionsByCategory[permission.category] = [];
      }
      permissionsByCategory[permission.category].push(permission);
    });
    
    return permissionsByCategory;
  },

  // Проверить, используется ли роль
  async isRoleInUse(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const role = allRoles.find(r => r.id === id);
    return role ? role.userCount > 0 : false;
  },

  // Получить статистику ролей
  async getRolesStats(): Promise<{
    total: number;
    system: number;
    custom: number;
    active: number;
    inactive: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    initializeRolesData();
    
    return {
      total: allRoles.length,
      system: allRoles.filter(r => r.isSystem).length,
      custom: allRoles.filter(r => !r.isSystem).length,
      active: allRoles.filter(r => r.isActive).length,
      inactive: allRoles.filter(r => !r.isActive).length
    };
  },

  // Принудительная инициализация данных
  initializeData(): void {
    initializeRolesData();
  }
};
