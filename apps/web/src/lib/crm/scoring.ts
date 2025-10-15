import type { KPI } from './types';
export function riskScore(k: KPI): number {
  let s = 0;
  if ((k.debt?.amount ?? 0) > 0) s += 40;
  if (k.openShipments > 3) s += 20;
  if (k.ordersCount === 0) s += 10;
  return Math.min(100, s);
}

