export type ShipmentStatus =
  | 'REQUEST'
  | 'NEW'
  | 'RECEIVE'
  | 'RECONCILE'
  | 'PACK'
  | 'MERGE'
  | 'IN_TRANSIT'
  | 'ON_DELIVERY'
  | 'DELIVERED'
  | 'ARCHIVED'
  | 'CANCELLED'
  | 'DELETED';

export type Role = 'USER'|'ADMIN'|'SUPER_ADMIN';

export type LineItem = {
  id: string;
  sku?: string;
  name: string;
  qty: number;           // заявлено/факт зависит от контекста
  unit?: 'pcs'|'kg'|'m3';
  weightKg?: number;
  volumeM3?: number;
  // link to origin chain for lineage:
  originId?: string;     // атомарная позиция-источник
};

export type LinesState = {
  version: number;       // для конкурентных апдейтов
  items: LineItem[];
  remaining?: number;    // агрегаты (по qty)
  delivered?: number;
};

export type TransitionKey =
  | 'receive_full' | 'receive_partial'
  | 'start_reconcile' | 'finish_reconcile'
  | 'open_packing'
  | 'attach_merge' | 'detach_merge' | 'finish_merge'
  | 'arrive_to_city' | 'deliver_full' | 'deliver_partial'
  | 'cancel';

export type FSMEvent = {
  chatId: string;
  from: ShipmentStatus;
  to: ShipmentStatus;
  by: Role;
  key: TransitionKey;
  atISO: string;
  payload?: any;
  idempotencyKey?: string;
};

export type MergeAttachTarget = {
  chatId: string;     // присоединяемый чат
  pickItems?: { id: string; qty: number }[]; // выбор позиций (необяз.)
};

export type SplitPlan = {
  toNewChat: boolean;
  newTitle?: string;
  picks: { id: string; qty: number }[];   // что уходит в новую отгрузку
};

export type FSMError = {
  code: 'INVALID_TRANSITION'|'CONFLICT'|'VALIDATION'|'NETWORK';
  message: string;
  details?: any;
};

