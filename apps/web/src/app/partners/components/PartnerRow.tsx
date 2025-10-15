'use client';
import Link from 'next/link';
import type { Partner } from '@/lib/partners/types';
import { CRM_V1_ENABLED } from '@/lib/flags';

export default function PartnerRow({ p }: { p: Partner }) {
  const href = `/partners/${p.id}`;
  
  return (
    <Link href={href} className="block rounded-2xl border p-2 hover:bg-[var(--muted)]">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-300 shrink-0 grid place-items-center">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" fill="#9CA3AF"/>
            <path d="M4 22c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="#9CA3AF"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[16px] font-semibold leading-5">{p.handle}</div>
          <div className="text-xs text-gray-500 truncate">{p.fullName || '—'}</div>
        </div>
        <div className="flex items-center gap-2">
          {/* bubble непрочитанного чата */}
          {p.unread && p.unread > 0 && (
            <div className="h-7 w-7 rounded-full bg-emerald-500 grid place-items-center text-white text-[11px]">
              {p.unread > 9 ? '9+' : p.unread}
            </div>
          )}
          {/* CRM кнопка */}
          {CRM_V1_ENABLED && (
            <Link 
              href={`/crm/partner/${p.id}`}
              className="h-7 px-2 rounded-lg border text-xs grid place-items-center"
              onClick={(e) => e.stopPropagation()}
            >
              CRM
            </Link>
          )}
        </div>
      </div>
    </Link>
  );
}
