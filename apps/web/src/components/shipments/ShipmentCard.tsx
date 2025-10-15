'use client';
import Link from 'next/link';
import { STATUS_CLASS, STATUS_LABEL } from '@/lib/shipments/ui-map';
import type { ShipmentListItem } from '@/lib/shipments/types';
import { ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

type Props = {
  item: ShipmentListItem;
  href?: string; // по умолчанию `/chat/[id]`
};

export default function ShipmentCard({ item, href }: Props) {
  const url = href ?? `/chat/${item.id}`;
  const isRequest = item.kind === 'REQUEST';
  const unread = item.unreadCount && item.unreadCount > 0;

  return (
    <Link
      data-testid="shipment-card"
      data-id={item.id}
      href={url}
      className={`block rounded-2xl border p-4 transition-colors bg-white ${isRequest ? 'border-[var(--brand)]' : 'border-[var(--border)]'} hover:bg-[var(--muted)]`}
    >
      <div className="flex items-start gap-3">
        {/* Левая колонка */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-[15px] truncate">{item.number}</div>
            {/* Статус-чип */}
            <span className={`text-xs px-2 h-6 inline-flex items-center rounded-full ${STATUS_CLASS[item.status]}`}>
              {STATUS_LABEL[item.status]}
            </span>
            {/* Finance badge */}
            {item.financeBadge === 'debt' && (
              <span className="text-[11px] inline-flex items-center gap-1 px-2 h-6 rounded-full bg-red-50 text-red-700 border border-red-200">
                <AlertTriangle className="h-3.5 w-3.5" /> Debt
              </span>
            )}
            {item.financeBadge === 'ok' && (
              <span className="text-[11px] inline-flex items-center gap-1 px-2 h-6 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> OK
              </span>
            )}
          </div>

          <div className="mt-1 text-sm text-[var(--text-secondary)] truncate">
            {isRequest ? 'Request' : 'Shipment'} · Updated {new Date(item.updatedAtISO).toLocaleString()}
          </div>

          <div className="mt-1 text-sm text-[var(--text-secondary)] truncate">
            {item.ownerName ? `Client: ${item.ownerName}` : item.partnerName ? `Partner: ${item.partnerName}` : ''}
          </div>
        </div>

        {/* Правая колонка */}
        <div className="flex flex-col items-end gap-2">
          {unread && (
            <span className="min-w-[24px] h-6 rounded-full bg-black text-white text-xs px-2 flex items-center justify-center">
              {item.unreadCount}
            </span>
          )}
          <ArrowRight className="h-5 w-5 opacity-50" />
        </div>
      </div>
    </Link>
  );
}
