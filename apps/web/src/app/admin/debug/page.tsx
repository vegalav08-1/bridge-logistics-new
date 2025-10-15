'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BackButton } from '@/components/layout/BackButton';
import { usersApi } from '@/lib/admin/users-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DebugPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updateEmail, setUpdateEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const userList = await usersApi.getUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetData = () => {
    usersApi.resetMockData();
    loadUsers();
  };

  const clearStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mockUsers');
      alert('localStorage очищен');
      loadUsers();
    }
  };

  const handleUpdatePassword = async () => {
    if (!updateEmail || !newPassword) {
      alert('Введите email и пароль');
      return;
    }
    
    try {
      await usersApi.updateUserPassword(updateEmail, newPassword);
      alert('Пароль успешно обновлен!');
      setUpdateEmail('');
      setNewPassword('');
      loadUsers();
    } catch (error) {
      alert(`Ошибка: ${error}`);
    }
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
                  Отладка пользователей
                </h1>
                <p className="text-gray-600 mt-1">
                  Управление mock данными для тестирования
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Управление данными</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={loadUsers} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Загрузка...' : 'Загрузить пользователей'}
              </Button>
              
              <Button 
                onClick={resetData}
                variant="secondary"
                className="w-full"
              >
                Сбросить данные
              </Button>
              
              <Button 
                onClick={clearStorage}
                variant="destructive"
                className="w-full"
              >
                Очистить localStorage
              </Button>
            </CardContent>
          </Card>

          {/* Update Password */}
          <Card>
            <CardHeader>
              <CardTitle>Обновить пароль</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email пользователя
                </label>
                <input
                  type="email"
                  value={updateEmail}
                  onChange={(e) => setUpdateEmail(e.target.value)}
                  placeholder="vegalav08@gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Новый пароль
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="1688Andrey"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <Button 
                onClick={handleUpdatePassword}
                className="w-full"
              >
                Обновить пароль
              </Button>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>Текущие пользователи ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-gray-500">Нет пользователей</p>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-gray-600">
                            {user.role} • {user.status}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          ID: {user.id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
