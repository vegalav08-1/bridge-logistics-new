'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
// import { Container } from '@yp/ui';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const refToken = searchParams.get('refToken');

  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [refAdminId, setRefAdminId] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [referralInfo, setReferralInfo] = useState<{adminEmail: string, label?: string} | null>(null);

  useEffect(() => {
    if (refToken) {
      // Загружаем информацию о реферальной ссылке
      fetch(`/api/referrals/preview?token=${refToken}`)
        .then(res => res.json())
        .then(data => {
          if (data.adminEmail) {
            setReferralInfo(data);
          }
        })
        .catch(() => {
          // Игнорируем ошибки, просто не показываем информацию
        });
    }
  }, [refToken]);

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
    
    try {
    const res = await fetch('/api/auth/register', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email, 
        password, 
        refAdminId: refAdminId || undefined,
        refToken: refToken || undefined
      })
    });
      
      if (res.ok) {
        setSuccess(true);
      } else {
        const { error } = await res.json().catch(() => ({ error: 'Ошибка регистрации' }));
        setErr(error || 'Ошибка регистрации');
      }
    } catch {
      setErr('Ошибка сети');
    }
    
    setLoading(false);
  }

  if (success) {
    return (
      <main className="mx-auto max-w-sm px-4 py-8">
        <h1 className="text-2xl font-bold">Регистрация</h1>
        <div className="mt-6 rounded bg-green-50 p-4">
          <p className="text-green-800">
            Пользователь создан! Проверьте email для подтверждения.
          </p>
        </div>
        <div className="mt-4 text-center">
          <a href="/login" className="text-brand hover:underline">Войти</a>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-8">
      <h1 className="text-2xl font-bold">Регистрация</h1>
      
      {referralInfo && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            Вы регистрируетесь в ветку администратора: <strong>{referralInfo.adminEmail}</strong>
          </p>
          {referralInfo.label && (
            <p className="text-xs text-green-600 mt-1">{referralInfo.label}</p>
          )}
        </div>
      )}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input 
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Пароль</label>
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
        <div>
          <label className="block text-sm font-medium">ID администратора (опционально)</label>
          <input 
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" 
            type="text" 
            value={refAdminId} 
            onChange={e => setRefAdminId(e.target.value)} 
            disabled={loading}
            placeholder="Введите ID администратора"
          />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button 
          disabled={loading} 
          className="w-full rounded bg-brand px-4 py-2 font-semibold text-white disabled:opacity-60 hover:bg-brand/90 transition-colors"
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
        <div className="text-center text-sm">
          <a href="/login" className="text-brand hover:underline">Уже есть аккаунт? Войти</a>
        </div>
      </form>
    </main>
  );
}
