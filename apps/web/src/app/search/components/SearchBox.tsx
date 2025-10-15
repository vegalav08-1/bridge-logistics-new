'use client';
import { useGlobalSearch } from '@/lib/search/useGlobalSearch';

export default function SearchBox(){
  const s = useGlobalSearch();
  return (
    <div className="w-full">
      <div className="h-11 rounded-2xl border flex items-center px-3 gap-2">
        <input
          data-testid="global-search-input"
          className="flex-1 outline-none"
          placeholder="Номер BR-/REQ-/LP..., телефон, адрес…"
          onChange={(e)=>s.runDebounced(e.target.value)}
        />
        {s.loading && <div className="text-xs text-gray-500">Поиск…</div>}
      </div>
      {s.error && <div className="text-sm text-red-600 mt-2">{s.error}</div>}
    </div>
  );
}


