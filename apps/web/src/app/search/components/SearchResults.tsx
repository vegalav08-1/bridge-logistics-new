'use client';
import { useGlobalSearch } from '@/lib/search/useGlobalSearch';
import ResultCard from './ResultCard';

export default function SearchResults(){
  const s = useGlobalSearch();
  return (
    <div className="mt-3 space-y-2">
      {s.items.length===0 && s.canSearch && !s.loading && <div className="text-sm text-gray-500">Ничего не найдено</div>}
      {s.items.map((r:any)=> <ResultCard key={`${r.entity}_${r.id}`} r={r} />)}
      {s.cursor && (
        <button className="h-10 w-full border rounded-xl mt-2" onClick={s.loadMore}>Ещё</button>
      )}
    </div>
  );
}


