'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BackButton } from '@/components/layout/BackButton';
import { FLAGS } from '@yp/shared';

interface User {
  id: string;
  email: string;
  createdAt: string;
  parentAdminId: string;
}

interface PartnersResponse {
  users: User[];
  nextCursor: string | null;
  hasMore: boolean;
}

export default function PartnersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  useEffect(() => {
    if (!FLAGS.ADMIN_PARTNERS_ENABLED) {
      setError('Раздел Партнёры отключён');
      setLoading(false);
      return;
    }

    loadUsers();
  }, []);

  const loadUsers = async (cursor?: string, append = false) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (cursor) params.append('cursor', cursor);
      params.append('limit', '20');

      const response = await fetch(`/api/admin/partners/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data: PartnersResponse = await response.json();
        
        if (append) {
          setUsers(prev => [...prev, ...data.users]);
        } else {
          setUsers(data.users);
        }
        
        setHasMore(data.hasMore);
        setNextCursor(data.nextCursor);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка загрузки пользователей');
      }
    } catch {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUsers([]);
    setNextCursor(null);
    loadUsers();
  };

  const handleLoadMore = () => {
    if (nextCursor) {
      loadUsers(nextCursor, true);
    }
  };

  const handleUserClick = (userId: string) => {
    router.push(`/admin/clients/${userId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  if (error) {
    return (
      <main className="mx-auto max-w-screen-sm px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand text-white rounded-md hover:bg-brand/90 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-screen-sm px-4 py-8">
      {/* Заголовок с кнопкой назад */}
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h1 className="text-2xl font-bold">Партнёры</h1>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по email..."
            className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-brand text-white rounded-md hover:bg-brand/90 transition-colors disabled:opacity-50"
          >
            Поиск
          </button>
        </div>
      </form>

      {loading && users.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">
            {searchQuery ? 'Пользователи не найдены' : 'У вас пока нет партнёров'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleUserClick(user.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {getInitials(user.email)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {user.email}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Регистрация: {formatDate(user.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    User
                  </span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="text-center py-4">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-brand bg-white border border-brand rounded-md hover:bg-brand hover:text-white transition-colors disabled:opacity-50"
              >
                {loading ? 'Загрузка...' : 'Загрузить ещё'}
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}





