export const SHIPMENT_STATUSES = [
  'REQUEST',
  'NEW',
  'RECEIVE',
  'RECONCILE',
  'PACK',
  'MERGE',
  'IN_TRANSIT',
  'ON_DELIVERY',
  'DELIVERED',
  'ARCHIVED',
  'CANCELLED',
] as const;
export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];
