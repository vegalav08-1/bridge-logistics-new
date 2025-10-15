'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BackButton } from '@/components/layout/BackButton';
import AvatarBadge from '@/components/crm/AvatarBadge';

export default function CRMList() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Мок данные для демонстрации
    const mockProfiles = [
      { id: 'u123', kind: 'USER', displayName: 'Иван Петров', segments: ['NEWBIE'], ltv: 5000, ordersCount: 3 },
      { id: 'p456', kind: 'PARTNER', displayName: 'ООО Логистика', segments: ['VIP', 'REF_ADMIN'], ltv: 25000, ordersCount: 15 },
      { id: 'u789', kind: 'USER', displayName: 'Мария Сидорова', segments: ['REPEATER'], ltv: 12000, ordersCount: 5 },
    ];
    setProfiles(mockProfiles);
    setLoading(false);
  }, []);

  if (loading) return <div className="p-3">Loading…</div>;

  return (
    <div className="container mx-auto p-3 space-y-3">
      {/* Заголовок с кнопкой назад */}
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <h1 className="text-lg font-semibold">CRM - Клиенты и Партнёры</h1>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button className="h-9 px-3 rounded-xl border">Фильтры</button>
          <button className="h-9 px-3 rounded-xl border">Экспорт</button>
        </div>
      </div>

      <div className="space-y-2">
        {profiles.map(profile => (
          <Link
            key={profile.id}
            href={`/crm/${profile.kind.toLowerCase()}/${profile.id}`}
            className="block rounded-2xl border p-3 hover:bg-[var(--muted)] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AvatarBadge name={profile.displayName} />
                <div>
                  <div className="font-medium">{profile.displayName}</div>
                  <div className="text-xs text-gray-600">{profile.kind} · LTV: {profile.ltv}</div>
                </div>
              </div>
              <div className="flex gap-2">
                {profile.segments.map((s: string) => (
                  <span key={s} className="h-6 px-2 rounded-full border text-xs">{s}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
