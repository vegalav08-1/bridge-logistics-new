'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getCurrentSession, clearSessionCookie } from '@/lib/auth/session';

interface UserSwitcherProps {
  className?: string;
}

export function UserSwitcher({ className = '' }: UserSwitcherProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      setCurrentUser(session);
    }
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      clearSessionCookie();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchUser = (userId: string) => {
    // В реальном приложении это будет переключение сессии
    // Пока просто обновляем страницу с новым userId
    const url = new URL(window.location.href);
    url.searchParams.set('userId', userId);
    window.location.href = url.toString();
  };

  if (!currentUser) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">Не авторизован</p>
          <Button onClick={() => router.push('/login')} className="w-full">
            Войти
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="font-semibold text-lg">Текущий пользователь</h3>
          <p className="text-sm text-gray-600">{currentUser.email}</p>
          <p className="text-xs text-gray-500">Роль: {currentUser.role}</p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Быстрое переключение:</h4>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => switchUser('user-1')}
              disabled={currentUser.userId === 'user-1'}
            >
              vegalav0202@gmail.com (SUPER_ADMIN)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => switchUser('user-2')}
              disabled={currentUser.userId === 'user-2'}
            >
              admin@example.com (ADMIN)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => switchUser('user-3')}
              disabled={currentUser.userId === 'user-3'}
            >
              user@example.com (USER)
            </Button>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          disabled={loading}
          variant="destructive"
          className="w-full"
        >
          {loading ? 'Выход...' : 'Выйти'}
        </Button>
      </div>
    </Card>
  );
}
