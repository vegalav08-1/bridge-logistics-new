export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export type Resource =
  | 'shipment' | 'request' | 'message' | 'file'
  | 'finance'  | 'offer'   | 'reconcile' | 'packing'
  | 'document' | 'notification' | 'partner'
  | 'audit'    | 'admin_area';

export type Action =
  | 'view' | 'list' | 'create' | 'update' | 'delete'
  | 'transition' | 'partial' | 'merge' | 'split'
  | 'comment' | 'mention'
  | 'pay' | 'invoice' | 'charge'
  | 'download' | 'download_clean' | 'ocr' | 'annotate' | 'esign'
  | 'configure' | 'manage';

export type TenantFlags = Record<string, boolean>; // FSM_V2_ENABLED, FILES_V2_ENABLED и т.д.

export type ACLContext = {
  role: Role;
  userId?: string;
  ownerId?: string;                // владелец сущности (для canOwn)
  tenantFlags?: TenantFlags;
  shipmentStatus?: string;         // текущий статус (для FSM-гвардов)
  locale?: 'ru'|'en';
};

