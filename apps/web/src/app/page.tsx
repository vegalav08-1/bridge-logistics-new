'use client';

import { useRouter } from 'next/navigation';
import { HOME_V1_ENABLED } from '@/lib/flags';
import { useACL } from '@/lib/acl/context';
import { canSeeAdminTile } from '@/lib/acl/role-guards';
import HomeHeader from '@/components/home/HomeHeader';
import Tile from '@/components/home/Tile';
import { User, Settings, Users, Barcode, UserCheck, Shield } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { ctx } = useACL();
  

        const handleLogout = async () => {
          try {
            // Выполняем logout через API
            const response = await fetch('/api/auth/logout', {
              method: 'POST',
              credentials: 'include',
            });

            if (response.ok) {
              // Очищаем localStorage
              localStorage.clear();
              // Перенаправляем на страницу входа
              window.location.href = '/login';
            } else {
              // Если API не сработал, все равно очищаем и перенаправляем
              localStorage.clear();
              window.location.href = '/login';
            }
          } catch (error) {
            console.error('Ошибка выхода из системы:', error);
            // В любом случае очищаем localStorage и перенаправляем на страницу входа
            localStorage.clear();
            window.location.href = '/login';
          }
        };

  if (!HOME_V1_ENABLED) {
    return (
      <div className="px-4 py-3">
        <div className="text-sm text-gray-500">Главная страница отключена</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <HomeHeader />
      <div className="container px-4 pb-4 flex-1">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-2">
          <Tile 
            href="/shipments" 
            label="Аккаунт" 
            icon={<User className="h-8 w-8" />} 
          />
          <Tile 
            href="/settings"  
            label="Настройки" 
            icon={<Settings className="h-8 w-8" />} 
          />
          <Tile 
            href="/partners"  
            label="Партнеры" 
            icon={<Users className="h-8 w-8" />} 
          />
          <Tile 
            href="/crm/list"  
            label="CRM" 
            icon={<UserCheck className="h-8 w-8" />} 
          />
          <Tile 
            label="Сканер"      
            icon={<Barcode className="h-8 w-8" />} 
            onClick={() => router.push('/search?scan=1')} 
          />
          {canSeeAdminTile(ctx.role) && (
            <Tile 
              href="/admin"  
              label="Админ панель" 
              icon={<Shield className="h-8 w-8" />} 
            />
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            className="h-11 px-6 rounded-xl border border-red-500 text-red-600"
            onClick={handleLogout}
            aria-label="Выйти"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}