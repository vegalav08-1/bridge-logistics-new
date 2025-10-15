// API для управления пользователями в административной панели

export interface User {
  id: string;
  email: string;
  password?: string; // Добавляем поле пароля
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin: string;
  parentAdminId?: string;
  parentAdmin?: {
    id: string;
    email: string;
  };
  children?: User[];
  permissions: string[];
  metadata: {
    loginCount: number;
    lastActivity: string;
    ipAddress: string;
    userAgent: string;
  };
}

export interface CreateUserRequest {
  email: string;
  role: 'ADMIN' | 'USER';
  parentAdminId?: string;
  permissions: string[];
}

export interface UpdateUserRequest {
  email?: string;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  status?: 'active' | 'inactive' | 'suspended';
  permissions?: string[];
}

// Функция для загрузки данных из localStorage
const loadUsersFromStorage = (): User[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('mockUsers');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('📦 Загружены пользователи из localStorage:', parsed.length);
      return parsed;
    }
  } catch (error) {
    console.error('Ошибка загрузки из localStorage:', error);
  }
  return [];
};

// Функция для сохранения данных в localStorage
const saveUsersToStorage = (users: User[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('mockUsers', JSON.stringify(users));
    console.log('💾 Пользователи сохранены в localStorage:', users.length);
  } catch (error) {
    console.error('Ошибка сохранения в localStorage:', error);
  }
};

// Исходные mock данные пользователей
const initialMockUsers: User[] = [
  {
    id: 'user-1',
    email: 'vegalav0202@gmail.com',
    role: 'SUPER_ADMIN',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    lastLogin: '2024-01-20T14:30:00Z',
    permissions: ['*'],
    metadata: {
      loginCount: 156,
      lastActivity: '2024-01-20T14:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  {
    id: 'user-2',
    email: 'admin@example.com',
    role: 'ADMIN',
    status: 'active',
    createdAt: '2024-01-16T09:00:00Z',
    lastLogin: '2024-01-20T12:15:00Z',
    permissions: ['shipment:manage', 'user:view', 'finance:view'],
    metadata: {
      loginCount: 89,
      lastActivity: '2024-01-20T12:15:00Z',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  },
  {
    id: 'user-3',
    email: 'user@example.com',
    role: 'USER',
    status: 'active',
    createdAt: '2024-01-17T11:00:00Z',
    lastLogin: '2024-01-20T08:45:00Z',
    parentAdminId: 'user-2',
    parentAdmin: {
      id: 'user-2',
      email: 'admin@example.com'
    },
    permissions: ['shipment:view', 'request:create'],
    metadata: {
      loginCount: 23,
      lastActivity: '2024-01-20T08:45:00Z',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
    }
  },
  {
    id: 'user-4',
    email: 'manager@company.com',
    role: 'ADMIN',
    status: 'inactive',
    createdAt: '2024-01-18T13:00:00Z',
    lastLogin: '2024-01-19T16:20:00Z',
    permissions: ['shipment:manage', 'user:view'],
    metadata: {
      loginCount: 45,
      lastActivity: '2024-01-19T16:20:00Z',
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  {
    id: 'user-5',
    email: 'client@business.com',
    role: 'USER',
    status: 'suspended',
    createdAt: '2024-01-19T15:00:00Z',
    lastLogin: '2024-01-19T17:30:00Z',
    parentAdminId: 'user-2',
    parentAdmin: {
      id: 'user-2',
      email: 'admin@example.com'
    },
    permissions: ['shipment:view'],
    metadata: {
      loginCount: 12,
      lastActivity: '2024-01-19T17:30:00Z',
      ipAddress: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (Android 13; Mobile; rv:109.0) Gecko/109.0 Firefox/109.0'
    }
  },
  {
    id: 'user-6',
    email: 'vegalav08@gmail.com',
    password: '1688Andrey',
    role: 'ADMIN',
    status: 'active',
    createdAt: '2024-01-20T10:00:00Z',
    lastLogin: '2024-01-20T15:30:00Z',
    permissions: ['shipment:manage', 'user:view', 'finance:view', 'admin:access'],
    metadata: {
      loginCount: 25,
      lastActivity: '2024-01-20T15:30:00Z',
      ipAddress: '192.168.1.106',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }
];

// Mock данные пользователей - всегда начинаем с исходных данных
let mockUsers: User[] = [...initialMockUsers];

// Функция для инициализации данных на клиенте
const initializeClientData = () => {
  if (typeof window === 'undefined') return;
  
  const storedUsers = loadUsersFromStorage();
  if (storedUsers.length > 0) {
    mockUsers = storedUsers;
    console.log('📦 Инициализация: загружены пользователи из localStorage:', mockUsers.length);
  } else {
    saveUsersToStorage(mockUsers);
    console.log('💾 Инициализация: сохранены исходные данные в localStorage');
  }
};

// Функции API
export const usersApi = {
  // Получить всех пользователей
  async getUsers(): Promise<User[]> {
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Инициализируем данные на клиенте
    initializeClientData();

    console.log(`📋 Загружено пользователей: ${mockUsers.length}`);
    console.log(`👥 Пользователи:`, mockUsers.map(u => ({ id: u.id, email: u.email, status: u.status, role: u.role })));

    return [...mockUsers];
  },

  // Получить пользователя по ID
  async getUserById(id: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsers.find(user => user.id === id) || null;
  },

  // Создать нового пользователя
  async createUser(userData: CreateUserRequest): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email,
      role: userData.role,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      parentAdminId: userData.parentAdminId,
      permissions: userData.permissions || [],
      metadata: {
        loginCount: 0,
        lastActivity: new Date().toISOString(),
        ipAddress: '192.168.1.1',
        userAgent: 'System Generated'
      }
    };

    mockUsers.push(newUser);
    saveUsersToStorage(mockUsers);
    
    // Логируем создание пользователя
    console.log(`✅ Новый пользователь создан: ${newUser.email} (ID: ${newUser.id}) с ролью: ${newUser.role}`);
    console.log(`📊 Всего пользователей: ${mockUsers.length}`);
    console.log(`👥 Список пользователей:`, mockUsers.map(u => ({ id: u.id, email: u.email, role: u.role, status: u.status })));
    
    return newUser;
  },

  // Обновить пользователя
  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('Пользователь не найден');
    }

    const updatedUser = {
      ...mockUsers[userIndex],
      ...userData,
      metadata: {
        ...mockUsers[userIndex].metadata,
        lastActivity: new Date().toISOString()
      }
    };

    mockUsers[userIndex] = updatedUser;
    saveUsersToStorage(mockUsers);
    
    console.log('✅ Пользователь обновлен:', updatedUser.email, 'роль:', updatedUser.role, 'статус:', updatedUser.status);
    return updatedUser;
  },

  // Удалить пользователя
  async deleteUser(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('Пользователь не найден');
    }

    const deletedUser = mockUsers[userIndex];
    mockUsers.splice(userIndex, 1);
    saveUsersToStorage(mockUsers);
    
    // Логируем удаление для отладки
    console.log(`🗑️ Пользователь удален: ${deletedUser.email} (ID: ${deletedUser.id})`);
    console.log(`📊 Осталось пользователей: ${mockUsers.length}`);
    
    return true;
  },

  // Изменить статус пользователя
  async changeUserStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('Пользователь не найден');
    }

    mockUsers[userIndex].status = status;
    mockUsers[userIndex].metadata.lastActivity = new Date().toISOString();
    saveUsersToStorage(mockUsers);
    
    return mockUsers[userIndex];
  },

  // Сбросить пароль пользователя
  async resetUserPassword(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('Пользователь не найден');
    }

    // В реальном приложении здесь была бы отправка email с новым паролем
    console.log(`Password reset for user ${id}`);
    return true;
  },

  // Получить статистику пользователей
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    byRole: {
      SUPER_ADMIN: number;
      ADMIN: number;
      USER: number;
    };
  }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const total = mockUsers.length;
    const active = mockUsers.filter(user => user.status === 'active').length;
    const inactive = mockUsers.filter(user => user.status === 'inactive').length;
    const suspended = mockUsers.filter(user => user.status === 'suspended').length;
    
    const byRole = {
      SUPER_ADMIN: mockUsers.filter(user => user.role === 'SUPER_ADMIN').length,
      ADMIN: mockUsers.filter(user => user.role === 'ADMIN').length,
      USER: mockUsers.filter(user => user.role === 'USER').length,
    };

    return {
      total,
      active,
      inactive,
      suspended,
      byRole
    };
  },

  // Экспорт пользователей в CSV
  async exportUsersToCSV(): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const headers = [
      'ID',
      'Email',
      'Роль',
      'Статус',
      'Дата создания',
      'Последний вход',
      'Количество входов',
      'IP адрес',
      'Разрешения'
    ];
    
    const rows = mockUsers.map(user => [
      user.id,
      user.email,
      user.role,
      user.status,
      new Date(user.createdAt).toLocaleDateString('ru-RU'),
      new Date(user.lastLogin).toLocaleDateString('ru-RU'),
      user.metadata.loginCount.toString(),
      user.metadata.ipAddress,
      user.permissions.join('; ')
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    return csvContent;
  },

  // Экспорт пользователей в Excel (JSON формат для простоты)
  async exportUsersToExcel(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockUsers.map(user => ({
      'ID': user.id,
      'Email': user.email,
      'Роль': user.role,
      'Статус': user.status,
      'Дата создания': new Date(user.createdAt).toLocaleDateString('ru-RU'),
      'Последний вход': new Date(user.lastLogin).toLocaleDateString('ru-RU'),
      'Количество входов': user.metadata.loginCount,
      'IP адрес': user.metadata.ipAddress,
      'Разрешения': user.permissions.join(', ')
    }));
  },

  // Обновить пароль пользователя
  async updateUserPassword(email: string, newPassword: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userIndex = mockUsers.findIndex(user => user.email === email);
    if (userIndex === -1) {
      throw new Error('Пользователь не найден');
    }

    mockUsers[userIndex].password = newPassword;
    saveUsersToStorage(mockUsers);
    
    console.log(`🔑 Пароль обновлен для пользователя: ${email}`);
    console.log(`🔐 Новый пароль: ${newPassword}`);
    
    return true;
  },

  // Сброс данных к исходному состоянию (для отладки)
  resetMockData(): void {
    mockUsers = [...initialMockUsers];
    saveUsersToStorage(mockUsers);
    console.log('🔄 Mock данные сброшены к исходному состоянию');
  },

  // Принудительная инициализация данных
  initializeData(): void {
    initializeClientData();
  },

  // Получить статистику пользователей по ролям
  async getUserStatsByRole(): Promise<Record<string, number>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    initializeClientData();
    
    const stats: Record<string, number> = {
      SUPER_ADMIN: 0,
      ADMIN: 0,
      USER: 0
    };
    
    mockUsers.forEach(user => {
      if (stats.hasOwnProperty(user.role)) {
        stats[user.role]++;
      }
    });
    
    return stats;
  },

  // Обновить роль пользователя
  async updateUserRole(userId: string, newRole: 'SUPER_ADMIN' | 'ADMIN' | 'USER'): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userIndex = mockUsers.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      throw new Error('Пользователь не найден');
    }

    const updatedUser = {
      ...mockUsers[userIndex],
      role: newRole,
      updatedAt: new Date().toISOString()
    };

    mockUsers[userIndex] = updatedUser;
    saveUsersToStorage(mockUsers);
    
    console.log('✅ Роль пользователя обновлена:', updatedUser.email, 'новая роль:', newRole);
    return updatedUser;
  }
};

