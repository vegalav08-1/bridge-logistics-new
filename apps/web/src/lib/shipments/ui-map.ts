import type { ShipmentStatus } from './types';

export const STATUS_LABEL: Record<ShipmentStatus, string> = {
  REQUEST: 'Request',
  NEW: 'New',
  RECEIVE: 'Receiving',
  RECONCILE: 'Reconcile',
  PACK: 'Packing',
  MERGE: 'Merge',
  IN_TRANSIT: 'In transit',
  ON_DELIVERY: 'On delivery',
  DELIVERED: 'Delivered',
  ARCHIVED: 'Archived',
  CANCELLED: 'Cancelled',
};

export const STATUS_CLASS: Record<ShipmentStatus, string> = {
  REQUEST: 'border-brand text-brand',
  NEW: 'bg-brand text-white',
  RECEIVE: 'bg-blue-600 text-white',
  RECONCILE: 'bg-amber-500 text-white',
  PACK: 'bg-violet-600 text-white',
  MERGE: 'bg-sky-600 text-white',
  IN_TRANSIT: 'bg-indigo-600 text-white',
  ON_DELIVERY: 'bg-teal-600 text-white',
  DELIVERED: 'bg-green-600 text-white',
  ARCHIVED: 'bg-zinc-500 text-white',
  CANCELLED: 'bg-red-600 text-white',
};


