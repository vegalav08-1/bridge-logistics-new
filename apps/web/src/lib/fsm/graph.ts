import type { ShipmentStatus, TransitionKey, Role } from './types';

type Edge = {
  from: ShipmentStatus;
  to: ShipmentStatus;
  key: TransitionKey;
  roles: Role[];
  guard?: (ctx: { role: Role; hasDebt?: boolean; hasReconcile?: boolean; }) => boolean;
};

export const EDGES: Edge[] = [
  { from:'NEW',       to:'RECEIVE',     key:'receive_full', roles:['ADMIN','SUPER'] },
  { from:'NEW',       to:'RECEIVE',     key:'receive_partial', roles:['ADMIN','SUPER'] },
  { from:'RECEIVE',   to:'RECONCILE',   key:'start_reconcile', roles:['ADMIN','SUPER'] },
  { from:'RECONCILE', to:'PACK',        key:'finish_reconcile', roles:['ADMIN','SUPER'], guard: (c)=>!!c.hasReconcile },
  { from:'PACK',      to:'MERGE',       key:'open_packing', roles:['ADMIN','SUPER'] }, // переход во «выполнено упаковку»
  { from:'MERGE',     to:'IN_TRANSIT',  key:'finish_merge', roles:['ADMIN','SUPER'] },
  { from:'IN_TRANSIT',to:'ON_DELIVERY', key:'arrive_to_city', roles:['ADMIN','SUPER'] },
  { from:'ON_DELIVERY',to:'DELIVERED',  key:'deliver_full', roles:['ADMIN','SUPER'], guard:(c)=>!c.hasDebt },
  { from:'ON_DELIVERY',to:'DELIVERED',  key:'deliver_partial', roles:['ADMIN','SUPER'], guard:(c)=>!c.hasDebt },
  { from:'ANY',       to:'CANCELLED',   key:'cancel', roles:['ADMIN','SUPER'] },
];

export function allowedTransitions(from: ShipmentStatus, role: Role, ctx: Parameters<NonNullable<Edge['guard']>>[0] = {} as any) {
  return EDGES.filter(e =>
    (e.from === from || e.from === 'ANY') &&
    e.roles.includes(role) &&
    (e.guard ? e.guard(ctx) : true)
  );
}

export function resolveNext(from: ShipmentStatus, key: TransitionKey): ShipmentStatus | null {
  const e = EDGES.find(e => (e.from === from || e.from === 'ANY') && e.key === key);
  return e?.to ?? null;
}


