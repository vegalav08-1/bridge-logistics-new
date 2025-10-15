'use client';

import { useRouter } from 'next/navigation';
import { HOME_V1_ENABLED } from '@/lib/flags';
import HomeHeader from '@/components/home/HomeHeader';
import Tile from '@/components/home/Tile';
import { User, Settings, Users, Barcode } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Сначала пытаемся выполнить полный logout через API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      // Очищаем localStorage независимо от результата API
      localStorage.clear();
      
      // Перенаправляем на страницу входа
      window.location.href = '/login';
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
        <div className="grid grid-cols-2 gap-4 mt-2">
          <Tile 
            href="/shipments" 
            label="Account" 
            icon={<User className="h-8 w-8" />} 
          />
          <Tile 
            href="/settings"  
            label="Settings" 
            icon={<Settings className="h-8 w-8" />} 
          />
          <Tile 
            href="/partners"  
            label="Partners" 
            icon={<Users className="h-8 w-8" />} 
          />
          <Tile 
            label="Scan"      
            icon={<Barcode className="h-8 w-8" />} 
            onClick={() => router.push('/search?scan=1')} 
          />
        </div>

        <div className="mt-8 flex justify-center">
          <button
            className="h-11 px-6 rounded-xl border border-red-500 text-red-600"
            onClick={handleLogout}
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
