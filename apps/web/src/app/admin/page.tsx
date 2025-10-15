'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useACL } from '@/lib/acl/context';
import { canAccessAdminPanel } from '@/lib/acl/role-guards';
import { BackButton } from '@/components/layout/BackButton';
import { usersApi } from '@/lib/admin/users-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Users, 
  Settings, 
  Shield, 
  BarChart, 
  Server, 
  Activity,
  User,
  X,
  Lock,
  Globe,
  Bell,
  FileText
} from '@/components/icons';

interface AdminMenuItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  permissions: string[];
}

const adminMenuItems: AdminMenuItem[] = [
  {
    id: 'users',
    title: 'Управление пользователями',
    description: 'Просмотр, редактирование и управление пользователями системы',
    icon: <Users className="h-6 w-6" />,
    href: '/admin/users',
    color: 'bg-blue-500',
    permissions: ['user:manage', 'user:view', 'user:edit']
  },
  {
    id: 'roles',
    title: 'Управление ролями',
    description: 'Настройка ролей и прав доступа пользователей',
    icon: <Shield className="h-6 w-6" />,
    href: '/admin/roles',
    color: 'bg-purple-500',
    permissions: ['role:manage', 'role:view', 'role:edit']
  },
  {
    id: 'tenant',
    title: 'Настройки тенанта',
    description: 'Конфигурация системы и настройки организации',
    icon: <Settings className="h-6 w-6" />,
    href: '/admin/tenant',
    color: 'bg-green-500',
    permissions: ['tenant:manage', 'tenant:view', 'tenant:edit']
  },
  {
    id: 'audit',
    title: 'Аудит и мониторинг',
    description: 'Логи действий, безопасность и мониторинг системы',
    icon: <Activity className="h-6 w-6" />,
    href: '/admin/audit',
    color: 'bg-orange-500',
    permissions: ['audit:view', 'audit:export']
  },
  {
    id: 'analytics',
    title: 'Аналитика',
    description: 'Статистика, отчеты и аналитика системы',
    icon: <BarChart className="h-6 w-6" />,
    href: '/admin/analytics',
    color: 'bg-indigo-500',
    permissions: ['analytics:view', 'analytics:export']
  },
  {
    id: 'database',
    title: 'Управление данными',
    description: 'Резервное копирование, миграции и управление БД',
    icon: <Server className="h-6 w-6" />,
    href: '/admin/database',
    color: 'bg-red-500',
    permissions: ['database:manage', 'database:backup']
  },
  {
    id: 'notifications',
    title: 'Уведомления',
    description: 'Настройка уведомлений и системных сообщений',
    icon: <Bell className="h-6 w-6" />,
    href: '/admin/notifications',
    color: 'bg-yellow-500',
    permissions: ['notification:manage', 'notification:view']
  },
  {
    id: 'logs',
    title: 'Системные логи',
    description: 'Просмотр и анализ системных логов',
    icon: <FileText className="h-6 w-6" />,
    href: '/admin/logs',
    color: 'bg-gray-500',
    permissions: ['logs:view', 'logs:export']
  }
];

export default function AdminPage() {
  const { ctx } = useACL();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    today: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Загружаем статистику
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const userStats = await usersApi.getUserStats();
        setStats({
          total: userStats.total,
          active: userStats.active,
          admins: userStats.byRole.ADMIN + userStats.byRole.SUPER_ADMIN,
          today: Math.floor(Math.random() * 200) + 100 // Мок данные для "Сегодня"
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, []);

  // Проверяем права доступа
  if (!canAccessAdminPanel(ctx.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Доступ запрещен
            </h2>
            <p className="text-gray-600">
              У вас нет прав для доступа к административной панели.
              Требуется роль SUPER_ADMIN.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleNavigation = (href: string) => {
    setLoading(true);
    router.push(href);
    // Сброс состояния загрузки через небольшую задержку
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <BackButton />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Административная панель
                </h1>
                <p className="text-gray-600 mt-1">
                  Управление системой и пользователями
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                SUPER_ADMIN
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adminMenuItems.map((item) => (
            <Card 
              key={item.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleNavigation(item.href)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${item.color} text-white`}>
                    {item.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {item.permissions.length} разрешений
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    disabled={loading}
                  >
                    Открыть
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Пользователи</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : stats.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Активные</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : stats.active.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Shield className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Админы</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : stats.admins.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Сегодня</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : stats.today.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
