'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import ShipmentCard from './ShipmentCard';
import { listShipments } from '@/lib/shipments/api';
import type { ShipmentsQuery, ShipmentListItem } from '@/lib/shipments/types';

type Props = {
  initialQuery?: ShipmentsQuery;
  onEmptyCTA?: () => void;
};

export default function ShipmentsList({ initialQuery, onEmptyCTA }: Props) {
  const [items, setItems] = useState<ShipmentListItem[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [end, setEnd] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const q = { ...(initialQuery ?? {}), cursor: reset ? undefined : cursor };
      const res = await listShipments(q);
      setItems(prev => reset ? res.items : [...prev, ...res.items]);
      setCursor(res.nextCursor);
      setEnd(!res.nextCursor);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [cursor, initialQuery, loading]);

  // Первичная загрузка / обновление при смене initialQuery
  useEffect(() => { setItems([]); setCursor(undefined); setEnd(false); load(true); }, [JSON.stringify(initialQuery)]); // eslint-disable-line

  // Бесконечная прокрутка
  useEffect(() => {
    if (!sentinelRef.current || end) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) load(); });
    }, { rootMargin: '400px' });
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [load, end]);

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-sm mb-3">Ошибка загрузки: {error}</div>
        <button className="px-4 h-10 rounded-xl border" onClick={() => load(true)}>Повторить</button>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="p-10 text-center">
        <div className="text-lg font-semibold mb-2">Нет отгрузок</div>
        <div className="text-sm text-[var(--text-secondary)] mb-4">Создайте первую — это займёт минуту.</div>
        {onEmptyCTA && <button className="px-4 h-10 rounded-xl bg-[var(--brand)] text-white" onClick={onEmptyCTA}>Create</button>}
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {items.map(item => (<ShipmentCard key={item.id} item={item} />))}
      {/* Скелеты */}
      {loading && (
        <>
          <div className="h-24 rounded-2xl bg-[var(--muted)] animate-pulse" />
          <div className="h-24 rounded-2xl bg-[var(--muted)] animate-pulse" />
        </>
      )}
      {/* Сенсор для подгрузки */}
      <div ref={sentinelRef} />
      {end && <div className="py-6 text-center text-xs text-[var(--text-secondary)]">Больше нет</div>}
    </div>
  );
}


