export type ShipmentKind = 'REQUEST' | 'SHIPMENT';

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
  | 'CANCELLED';

export interface ShipmentListItem {
  id: string;
  kind: ShipmentKind;
  number: string;           // BR-000123
  status: ShipmentStatus;
  createdAtISO: string;
  updatedAtISO: string;
  unreadCount?: number;
  ownerName?: string;       // для админа — владелец (клиент)
  partnerName?: string;     // для юзера — партнёр/админ
  financeBadge?: 'ok' | 'debt' | 'none';
}

export interface ShipmentsQuery {
  search?: string;
  status?: ShipmentStatus[];
  kind?: ShipmentKind[];
  cursor?: string;          // для пагинации
}

export interface ShipmentsResponse {
  items: ShipmentListItem[];
  nextCursor?: string;
}