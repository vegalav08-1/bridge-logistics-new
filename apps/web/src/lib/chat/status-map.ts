/**
 * Status flow and visual mapping for Chat UI3
 */

import { ShipmentStatus } from './types';

export const STATUS_FLOW: ShipmentStatus[] = [
  'REQUEST',
  'NEW',
  'RECEIVE',
  'PACK',
  'MERGE',
  'IN_TRANSIT',
  'ON_DELIVERY',
  'DELIVERED'
];

export const STATUS_LABEL: Record<ShipmentStatus, string> = {
  REQUEST: 'Запрос',
  NEW: 'Новый',
  RECEIVE: 'Сверка',
  PACK: 'Упаковка',
  MERGE: 'Упакован',
  IN_TRANSIT: 'В пути',
  ON_DELIVERY: 'Прибыло',
  DELIVERED: 'Выдано',
  CANCELLED: 'Отменено',
  DELETED: 'Удалено'
};

export const STATUS_COLOR: Record<ShipmentStatus, string> = {
  REQUEST: 'border-brand text-brand',
  NEW: 'bg-brand text-white',
  RECEIVE: 'bg-blue-600 text-white',
  PACK: 'bg-violet-600 text-white',
  MERGE: 'bg-sky-600 text-white',
  IN_TRANSIT: 'bg-indigo-600 text-white',
  ON_DELIVERY: 'bg-teal-600 text-white',
  DELIVERED: 'bg-green-600 text-white',
  CANCELLED: 'bg-red-600 text-white',
  DELETED: 'bg-gray-600 text-white',
};

/**
 * Get the current step index in the status flow
 */
export function getStatusStepIndex(status: ShipmentStatus): number {
  return STATUS_FLOW.indexOf(status);
}

/**
 * Check if a status is completed (comes before current status)
 */
export function isStatusCompleted(currentStatus: ShipmentStatus, checkStatus: ShipmentStatus): boolean {
  const currentIndex = getStatusStepIndex(currentStatus);
  const checkIndex = getStatusStepIndex(checkStatus);
  return checkIndex < currentIndex;
}

/**
 * Check if a status is current
 */
export function isStatusCurrent(currentStatus: ShipmentStatus, checkStatus: ShipmentStatus): boolean {
  return currentStatus === checkStatus;
}

/**
 * Check if a status is future (comes after current status)
 */
export function isStatusFuture(currentStatus: ShipmentStatus, checkStatus: ShipmentStatus): boolean {
  const currentIndex = getStatusStepIndex(currentStatus);
  const checkIndex = getStatusStepIndex(checkStatus);
  return checkIndex > currentIndex;
}

