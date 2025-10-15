'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ResetPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setErr('Токен не найден в URL');
    }
  }, [searchParams]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); 
    setErr(null);
    
    // Валидация
    if (password !== confirmPassword) {
      setErr('Пароли не совпадают');
      setLoading(false);
      return;
    }
    
    if (password.length < 8) {
      setErr('Пароль должен содержать минимум 8 символов');
      setLoading(false);
      return;
    }
    
    if (!token) {
      setErr('Токен не найден');
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      
      if (res.ok) {
        setSuccess(true);
      } else {
        const { error } = await res.json().catch(() => ({ error: 'Ошибка сброса пароля' }));
        setErr(error || 'Ошибка сброса пароля');
      }
    } catch {
      setErr('Ошибка сети');
    }
    
    setLoading(false);
  }

  if (success) {
    return (
      <main className="mx-auto max-w-sm px-4 py-8">
        <h1 className="text-2xl font-bold">Сброс пароля</h1>
        <div className="mt-6 rounded bg-green-50 p-4">
          <p className="text-green-800">
            Пароль изменён! Войдите с новым паролем.
          </p>
        </div>
        <div className="mt-4 text-center">
          <a href="/login" className="text-brand hover:underline">Войти</a>
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="mx-auto max-w-sm px-4 py-8">
        <h1 className="text-2xl font-bold">Сброс пароля</h1>
        <div className="mt-6 rounded bg-red-50 p-4">
          <p className="text-red-800">
            Токен не найден в URL. Проверьте ссылку из письма.
          </p>
        </div>
        <div className="mt-4 text-center">
          <a href="/forgot" className="text-brand hover:underline">Запросить новое письмо</a>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-8">
      <h1 className="text-2xl font-bold">Сброс пароля</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Новый пароль</label>
          <input 
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            disabled={loading}
            minLength={8}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Подтвердите пароль</label>
          <input 
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" 
            type="password" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            required 
            disabled={loading}
          />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button 
          disabled={loading} 
          className="w-full rounded bg-brand px-4 py-2 font-semibold text-white disabled:opacity-60 hover:bg-brand/90 transition-colors"
        >
          {loading ? 'Сброс...' : 'Сбросить пароль'}
        </button>
        <div className="text-center text-sm">
          <a href="/login" className="text-brand hover:underline">Вернуться к входу</a>
        </div>
      </form>
    </main>
  );
}
