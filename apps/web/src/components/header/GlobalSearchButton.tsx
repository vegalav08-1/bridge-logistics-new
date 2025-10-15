'use client';
import { useRouter } from 'next/navigation';
export default function GlobalSearchButton(){
  const r = useRouter();
  return (
    <button className="h-10 w-10 rounded-xl border grid place-items-center" aria-label="Поиск" onClick={()=>r.push('/search')}>
      <svg width="18" height="18" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke="currentColor" fill="none"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor"/></svg>
    </button>
  );
}


