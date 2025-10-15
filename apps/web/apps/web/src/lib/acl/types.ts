export type Role = 'USER' | 'ADMIN' | 'SUPER';

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

export type TenantFlags = Record<string, boolean>;

export type ACLContext = {
  role: Role;
  userId?: string;
  ownerId?: string;
  tenantFlags?: TenantFlags;
  shipmentStatus?: string;
  locale?: 'ru'|'en';
};
