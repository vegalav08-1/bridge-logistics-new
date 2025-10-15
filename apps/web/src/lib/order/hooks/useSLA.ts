'use client';
import { useEffect, useMemo, useState } from 'react';
import { SLA_STAGES } from '../sla';
import type { Order } from '../types';

export function useSLA(order: Order | null) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000 * 30); return () => clearInterval(t); }, []);
  const active = useMemo(() => {
    if (!order) return null;
    // Берём первый SLA-stage для текущего статуса
    return SLA_STAGES.find(s => s.status === order.status) ?? null;
  }, [order]);
  return { active, now };
}

