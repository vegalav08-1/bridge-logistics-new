'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Успешный вход
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Ошибка входа');
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Вход в систему
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Введите свои учетные данные
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder="Введите email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Пароль
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="Введите пароль"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="text-sm text-gray-600">
              <p className="font-medium">Тестовые аккаунты:</p>
              <div className="mt-2 space-y-1">
                <div><strong>Супер Админ:</strong> vegalav0202@gmail.com / admin123</div>
                <div><strong>Админ:</strong> admin@example.com / admin123</div>
                <div><strong>Пользователь:</strong> user@example.com / user123</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}