'use client';
import { riskScore } from '@/lib/crm/scoring';
export default function StatsKpis({ kpi }: { kpi: any }) {
  if (!kpi) return null;
  const risk = riskScore(kpi);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <div className="rounded-2xl border p-3"><div className="text-xs">LTV</div><div className="text-lg font-semibold">{kpi.ltv}</div></div>
      <div className="rounded-2xl border p-3"><div className="text-xs">ARPU</div><div className="text-lg font-semibold">{kpi.arpu}</div></div>
      <div className="rounded-2xl border p-3"><div className="text-xs">Orders</div><div className="text-lg font-semibold">{kpi.ordersCount}</div></div>
      <div className="rounded-2xl border p-3"><div className="text-xs">Risk</div><div className="text-lg font-semibold">{risk}</div></div>
    </div>
  );
}

