export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
export type Qty = { units: number; weightKg?: number; volumeM3?: number };

export type ScanType = 'ORDER_QR' | 'PACKAGE_QR' | 'ITEM_BARCODE';
export type PhotoMeta = { id: string; url?: string; uploading?: boolean; createdAtISO: string; };

export type ReceivingItem = {
  id: string;                 // внутренний id позиции приёмки
  sku?: string;
  name?: string;
  expected?: Qty;             // из заказа/ожиданий
  received?: Qty;             // факт приёмки (кумулятивно)
  damage?: 'NONE' | 'MINOR' | 'MAJOR';
  photos?: PhotoMeta[];
  notes?: string;
  sourceLabel?: string;       // внешний лейбл/трек
};

export type ReceivingSession = {
  id: string;
  orderId: string;
  startedAtISO: string;
  actorId: string;
  items: ReceivingItem[];
  closedAtISO?: string;
};

export type ReconcileDiff = {
  id: string;
  receivingItemId: string;
  type: 'OVER' | 'SHORT' | 'MISMATCH';
  deltaUnits: number;           // +/-
  comment?: string;
  resolved?: boolean;
  photos?: PhotoMeta[];
};

export type QAIssue = {
  id: string;
  receivingItemId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  kind: 'PACKAGING' | 'LABEL' | 'BROKEN' | 'WET' | 'OTHER';
  comment?: string;
  photos?: PhotoMeta[];
  resolved?: boolean;
};

export type Bin = { code: string; area: string; rack: string; shelf: string; cell: string; capacity?: Qty };
export type PutawayMove = {
  id: string;
  receivingItemId: string;
  binCode: string;
  qty: Qty;
  movedAtISO: string;
  by: string;
};

export type ReturnCase = {
  id: string;
  orderId: string;
  reason: 'USER_REFUSED' | 'DEFECT' | 'LOST' | 'OTHER';
  initiatedBy: 'USER' | 'ADMIN' | 'SYSTEM';
  createdAtISO: string;
  items: Array<{ receivingItemId: string; qty: Qty }>;
  status: 'OPEN' | 'IN_PROGRESS' | 'SHIPPED_BACK' | 'CLOSED';
  photos?: PhotoMeta[];
  history: Array<{ atISO: string; note: string; by: string }>;
};

