'use client';
import Link from 'next/link';
import type { SearchResult } from '@/lib/search/types';

export default function ResultCard({ r }: { r: SearchResult }) {
  return (
    <Link href={r.link} className="block rounded-2xl border p-3 hover:bg-[var(--muted)]" data-testid="search-result">
      <div className="text-sm font-medium">{r.title}</div>
      {r.subtitle && <div className="text-xs text-gray-500">{r.subtitle}</div>}
      {r.badge && <div className="mt-1 text-[10px] inline-block px-2 py-0.5 rounded-full bg-gray-900 text-white">{r.badge}</div>}
    </Link>
  );
}


