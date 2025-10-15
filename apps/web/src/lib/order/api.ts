import type { Order, TransitionKey, JournalEvent } from './types';
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

let MEMORY: Record<string, Order> = {};

export async function fetchOrder(id: string): Promise<Order> {
  await wait(120);
  if (!MEMORY[id]) MEMORY[id] = {
    id, number: 'BR-000123', status: 'NEW', ownerRole: 'ADMIN',
    createdAtISO: new Date().toISOString(), updatedAtISO: new Date().toISOString(),
  };
  return structuredClone(MEMORY[id]);
}

export async function postTransition(id: string, key: TransitionKey, payload: any): Promise<Order> {
  await wait(120);
  const o = await fetchOrder(id);
  // (в реале запрос на сервер; тут просто переведём статус)
  const next = payload?.to ?? o.status;
  MEMORY[id] = { ...o, status: next, updatedAtISO: new Date().toISOString() };
  return structuredClone(MEMORY[id]);
}

export async function appendJournal(e: JournalEvent) { await wait(10); return { ok: true }; }
export async function fetchGates(id: string): Promise<Record<string, boolean>> { 
  await wait(60); 
  // Интеграция с WMS гейтами
  const { calcReconcileGate, calcPackedGate } = await import('@/lib/wms/gates');
  const reconcileOk = await calcReconcileGate(id);
  const packedOk = await calcPackedGate(id);
  
  return { 
    PAYMENT_OK: true, 
    RECONCILE_OK: reconcileOk, 
    PACKED_OK: packedOk, 
    NO_DEBT: true 
  }; 
}
