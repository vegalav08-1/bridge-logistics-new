'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [, setToken] = useState<string | null>(null);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      // Автоматически верифицируем при загрузке страницы
      verifyEmail(tokenParam);
    } else {
      setErr('Токен не найден в URL');
    }
  }, [searchParams]);

  async function verifyEmail(token: string) {
    setLoading(true);
    setErr(null);
    
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      if (res.ok) {
        setSuccess(true);
      } else {
        const { error } = await res.json().catch(() => ({ error: 'Ошибка подтверждения email' }));
        setErr(error || 'Ошибка подтверждения email');
      }
    } catch {
      setErr('Ошибка сети');
    }
    
    setLoading(false);
  }

  if (success) {
    return (
      <main className="mx-auto max-w-sm px-4 py-8">
        <h1 className="text-2xl font-bold">Подтверждение email</h1>
        <div className="mt-6 rounded bg-green-50 p-4">
          <p className="text-green-800">
            Email подтверждён! Теперь вы можете войти в систему.
          </p>
        </div>
        <div className="mt-4 text-center">
          <a href="/login" className="text-brand hover:underline">Войти</a>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-sm px-4 py-8">
        <h1 className="text-2xl font-bold">Подтверждение email</h1>
        <div className="mt-6 text-center">
          <p>Подтверждение email...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-8">
      <h1 className="text-2xl font-bold">Подтверждение email</h1>
      <div className="mt-6 rounded bg-red-50 p-4">
        <p className="text-red-800">
          {err || 'Ошибка подтверждения email'}
        </p>
      </div>
      <div className="mt-4 text-center">
        <a href="/register" className="text-brand hover:underline">Зарегистрироваться заново</a>
      </div>
    </main>
  );
}
