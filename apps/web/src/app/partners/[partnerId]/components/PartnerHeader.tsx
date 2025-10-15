'use client';
import Money from '@/components/finance/Money';

export default function PartnerHeader({ info }: { info: any }) {
  return (
    <div className="rounded-2xl border p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-300 grid place-items-center" />
        <div>
          <div className="text-sm font-medium">{info.handle}</div>
          <div className="text-xs text-gray-500">{info.fullName || '—'} · {info.role}</div>
        </div>
      </div>
      <div className="text-right text-xs">
        <div>Shipments: {info.stats?.shipments ?? 0}</div>
        <div>Unread: {info.stats?.unread ?? 0}</div>
        <div className={`${(info.stats?.debt ?? 0) > 0 ? 'text-red-600' : 'text-gray-600'}`}>
          Debt: {(info.stats?.debt ?? 0).toFixed(0)}
        </div>
      </div>
    </div>
  );
}

