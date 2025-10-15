'use client';

import { useState } from 'react';

export default function ForgotPage() {
  const [email, setEmail] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); 
    setErr(null);
    
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (res.ok) {
        setSuccess(true);
      } else {
        const { error } = await res.json().catch(() => ({ error: 'Ошибка отправки письма' }));
        setErr(error || 'Ошибка отправки письма');
      }
    } catch {
      setErr('Ошибка сети');
    }
    
    setLoading(false);
  }

  if (success) {
    return (
      <main className="mx-auto max-w-sm px-4 py-8">
        <h1 className="text-2xl font-bold">Восстановление пароля</h1>
        <div className="mt-6 rounded bg-green-50 p-4">
          <p className="text-green-800">
            Если пользователь с таким email существует, письмо отправлено.
          </p>
        </div>
        <div className="mt-4 text-center">
          <a href="/login" className="text-brand hover:underline">Вернуться к входу</a>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-8">
      <h1 className="text-2xl font-bold">Восстановление пароля</h1>
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
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button 
          disabled={loading} 
          className="w-full rounded bg-brand px-4 py-2 font-semibold text-white disabled:opacity-60 hover:bg-brand/90 transition-colors"
        >
          {loading ? 'Отправка...' : 'Отправить письмо'}
        </button>
        <div className="text-center text-sm">
          <a href="/login" className="text-brand hover:underline">Вернуться к входу</a>
        </div>
      </form>
    </main>
  );
}
