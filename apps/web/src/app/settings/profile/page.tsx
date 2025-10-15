'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useSettings } from '@/lib/settings/useSettings';
import { profileSchema } from '@/lib/settings/schema';

export default function ProfileSettings() {
  const router = useRouter();
  const s = useSettings();
  const [form, setForm] = React.useState({ companyName: '', contactName: '', email: '', phone: '' });

  React.useEffect(() => { 
    if (s.data) setForm({ ...form, ...s.data.profile }); 
  }, [s.data]);

  const save = async () => {
    const p = profileSchema.safeParse(form);
    if (!p.success) return alert('Проверьте поля');
    await s.save({ profile: p.data });
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-3 mb-4">
        <button 
          onClick={() => router.back()}
          className="h-10 w-10 rounded-xl border grid place-items-center hover:bg-[var(--muted)] transition-colors"
          aria-label="Назад"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">Профиль</h1>
      </div>
      <div className="grid gap-3 mt-3">
        <input 
          className="h-11 rounded-xl border px-3" 
          placeholder="Название компании" 
          value={form.companyName || ''} 
          onChange={e => setForm({ ...form, companyName: e.target.value })} 
        />
        <input 
          className="h-11 rounded-xl border px-3" 
          placeholder="Контактное лицо" 
          value={form.contactName || ''} 
          onChange={e => setForm({ ...form, contactName: e.target.value })} 
        />
        <input 
          className="h-11 rounded-xl border px-3" 
          placeholder="Email" 
          value={form.email || ''} 
          onChange={e => setForm({ ...form, email: e.target.value })} 
        />
        <input 
          className="h-11 rounded-xl border px-3" 
          placeholder="Телефон" 
          value={form.phone || ''} 
          onChange={e => setForm({ ...form, phone: e.target.value })} 
        />
        <div className="flex gap-2 justify-end">
          <button 
            className="h-11 px-4 rounded-xl border" 
            onClick={() => s.load()}
          >
            Сбросить
          </button>
          <button 
            className="h-11 px-4 rounded-xl bg-[var(--brand)] text-white" 
            onClick={save} 
            disabled={s.loading}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
