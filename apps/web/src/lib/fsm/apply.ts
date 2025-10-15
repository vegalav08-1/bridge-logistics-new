import type { LinesState, ShipmentStatus, TransitionKey } from './types';

export type LocalState = {
  status: ShipmentStatus;
  version: number;         // серверная версия (ETag-like)
  lines: LinesState;
};

export function applyOptimistic(s: LocalState, key: TransitionKey, payload: any): LocalState {
  const next = structuredClone(s);
  next.version += 1; // локальная версия для конфликтов

  switch (key) {
    case 'receive_partial': {
      const map = new Map(payload.lines.map((l: any) => [l.id, l.qtyAccepted]));
      next.lines.items = next.lines.items.map(it =>
        map.has(it.id) ? { ...it, qty: Math.max(0, it.qty - map.get(it.id)!) } : it
      );
      next.lines.remaining = Math.max(0, (next.lines.remaining ?? 0) - [...map.values()].reduce((a,b)=>a+b,0));
      return next;
    }
    case 'deliver_partial': {
      const map = new Map(payload.lines.map((l: any) => [l.id, l.qtyDelivered]));
      next.lines.items = next.lines.items.map(it =>
        map.has(it.id) ? { ...it, qty: Math.max(0, it.qty - map.get(it.id)!) } : it
      );
      next.lines.delivered = (next.lines.delivered ?? 0) + [...map.values()].reduce((a,b)=>a+b,0);
      return next;
    }
    default:
      return next;
  }
}

export function rollback(prev: LocalState): LocalState {
  return structuredClone(prev);
}

export function isConflict(serverVersion: number, localVersion: number): boolean {
  return serverVersion > localVersion;
}


