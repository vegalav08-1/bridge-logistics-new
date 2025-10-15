'use client';

import { useState } from 'react';
import { useACL } from '@/lib/acl/context';
import { canSeeAdminButton } from '@/lib/acl/role-guards';
import { Button } from '@/components/ui/Button';
import { 
  Shield, 
  Users, 
  Settings, 
  Activity, 
  BarChart,
  HardDrive,
  Bell,
  FileText,
  ChevronDown
} from '@/components/icons';

interface AdminMenuItem {
  id: string;
  title: string;
  href: string;
  icon: React.ReactNode;
}

const adminMenuItems: AdminMenuItem[] = [
  {
    id: 'users',
    title: 'Пользователи',
    href: '/admin/users',
    icon: <Users className="h-4 w-4" />
  },
  {
    id: 'roles',
    title: 'Роли',
    href: '/admin/roles',
    icon: <Shield className="h-4 w-4" />
  },
  {
    id: 'tenant',
    title: 'Настройки',
    href: '/admin/tenant',
    icon: <Settings className="h-4 w-4" />
  },
  {
    id: 'audit',
    title: 'Аудит',
    href: '/admin/audit',
    icon: <Activity className="h-4 w-4" />
  },
  {
    id: 'analytics',
    title: 'Аналитика',
    href: '/admin/analytics',
    icon: <BarChart className="h-4 w-4" />
  },
  {
    id: 'database',
    title: 'База данных',
    href: '/admin/database',
    icon: <HardDrive className="h-4 w-4" />
  },
  {
    id: 'notifications',
    title: 'Уведомления',
    href: '/admin/notifications',
    icon: <Bell className="h-4 w-4" />
  },
  {
    id: 'logs',
    title: 'Логи',
    href: '/admin/logs',
    icon: <FileText className="h-4 w-4" />
  }
];

export function AdminPanelButton() {
  const { ctx } = useACL();
  const [isOpen, setIsOpen] = useState(false);

  // Показываем кнопку только для SUPER_ADMIN
  if (!canSeeAdminButton(ctx.role)) {
    return null;
  }

  const handleMenuItemClick = (href: string) => {
    setIsOpen(false);
    // В реальном приложении здесь был бы переход через router
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
      >
        <Shield className="h-4 w-4" />
        <span className="hidden sm:inline">Админ</span>
        <ChevronDown className="h-3 w-3" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Административная панель</h3>
                  <p className="text-xs text-gray-500">SUPER_ADMIN</p>
                </div>
              </div>
              
              <div className="space-y-1">
                {adminMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item.href)}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleMenuItemClick('/admin')}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm font-medium text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  <span>Главная панель</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
