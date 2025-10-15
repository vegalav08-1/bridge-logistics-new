'use client';
import { usePartners } from '@/lib/partners/usePartners';
import { BackButton } from '@/components/layout/BackButton';
import SearchBar from './components/SearchBar';
import PlusAction from './components/PlusAction';
import PartnerList from './components/PartnerList';
import { PARTNERS_V3_ENABLED } from '@/lib/flags';

export default function PartnersPage() {
  const p = usePartners();
  
  if (!PARTNERS_V3_ENABLED) {
    return (
      <div className="px-4 py-3">
        <div className="text-sm text-gray-500">Partners V3 feature is disabled</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 space-y-3">
      {/* Заголовок с кнопкой назад */}
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <h1 className="text-lg font-semibold">Партнеры</h1>
      </div>

      {/* Поиск + Плюсик */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchBar value={p.q} onChange={p.search} />
        </div>
        <PlusAction role={p.meRole as any} />
      </div>

      {/* Список */}
      <PartnerList items={p.partners} />
    </div>
  );
}
