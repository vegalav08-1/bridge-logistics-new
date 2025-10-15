'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SETTINGS_V1_ENABLED } from '@/lib/flags';
import SettingsList from '@/components/settings/SettingsList';

export default function SettingsPage() {
  const router = useRouter();

  if (!SETTINGS_V1_ENABLED) {
    return (
      <div className="px-4 py-3">
        <div className="text-sm text-gray-500">Настройки отключены</div>
      </div>
    );
  }

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
        <h1 className="text-lg font-semibold">Настройки</h1>
      </div>
      <div className="mt-3"><SettingsList /></div>
    </div>
  );
}
