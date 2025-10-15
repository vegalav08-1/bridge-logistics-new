'use client';
import { useState } from 'react';
import { STATUS_LABEL } from '@/lib/shipments/ui-map';
import type { ShipmentStatus, ShipmentKind } from '@/lib/shipments/types';
import { Search, Plus, Filter } from 'lucide-react';

type Props = {
  valueSearch?: string;
  onSearchChange?: (v: string) => void;
  selectedKinds?: ShipmentKind[];
  onKindsChange?: (kinds: ShipmentKind[]) => void;
  selectedStatuses?: ShipmentStatus[];
  onStatusesChange?: (st: ShipmentStatus[]) => void;
  onCreateClick?: () => void;
  canCreate?: boolean;
  isAdmin?: boolean;
};

const ALL_STATUSES: ShipmentStatus[] = [
  'REQUEST','NEW','RECEIVE','RECONCILE','PACK','MERGE','IN_TRANSIT','ON_DELIVERY','DELIVERED'
];

export default function ShipmentsHeader(props: Props) {
  const {
    valueSearch = '',
    onSearchChange,
    selectedKinds = [],
    onKindsChange,
    selectedStatuses = [],
    onStatusesChange,
    onCreateClick,
    canCreate = true,
    isAdmin = false,
  } = props;

  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggleKind = (k: ShipmentKind) => {
    const set = new Set(selectedKinds);
    set.has(k) ? set.delete(k) : set.add(k);
    onKindsChange?.(Array.from(set));
  };

  const toggleStatus = (s: ShipmentStatus) => {
    const set = new Set(selectedStatuses);
    set.has(s) ? set.delete(s) : set.add(s);
    onStatusesChange?.(Array.from(set));
  };

  return (
    <div className="sticky top-[56px] z-10 bg-white/90 backdrop-blur border-b border-[var(--border)]">
      <div className="px-4 py-3 space-y-3">
        {/* Поиск */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              data-testid="shipments-search"
              value={valueSearch}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search by number, name…"
              className="w-full h-11 rounded-xl border px-10 outline-none focus-visible:ring-2 ring-[var(--brand)]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
          </div>
          <button
            data-testid="filters-toggle"
            className="h-11 px-3 rounded-xl border flex items-center gap-2"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
          >
            <Filter className="h-5 w-5" />
            Filters
          </button>
          {canCreate && (
            <button
              data-testid="create-cta"
              onClick={onCreateClick}
              className="h-11 px-4 rounded-xl bg-[var(--brand)] text-white flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              {isAdmin ? 'Create shipment' : 'Create request'}
            </button>
          )}
        </div>

        {/* Фильтры */}
        {filtersOpen && (
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap">
              {(['REQUEST', 'SHIPMENT'] as ShipmentKind[]).map((k) => {
                const active = selectedKinds.includes(k);
                return (
                  <button
                    key={k}
                    onClick={() => toggleKind(k)}
                    className={`h-8 px-3 rounded-full border ${active ? 'bg-[var(--brand)] text-white' : ''}`}
                  >
                    {k === 'REQUEST' ? 'Requests' : 'Shipments'}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 flex-wrap">
              {ALL_STATUSES.map((s) => {
                const active = selectedStatuses.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className={`h-8 px-3 rounded-full border ${active ? 'bg-black text-white' : ''}`}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
