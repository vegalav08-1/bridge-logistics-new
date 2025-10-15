/**
 * Утилиты для работы со статусами
 */

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

export type ChatType = 'REQUEST' | 'SHIPMENT';

export interface StatusInfo {
  label: string;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'gray' | 'red';
  variant: 'solid' | 'outline';
}

export function getStatusInfo(status: string, type: ChatType): StatusInfo {
  // Для REQUEST всегда зелёный
  if (type === 'REQUEST') {
    return {
      label: 'Запрос',
      color: 'green',
      variant: 'solid'
    };
  }
  
  // Для SHIPMENT по статусу
  switch (status) {
    case 'NEW':
      return { label: 'Новая', color: 'blue', variant: 'solid' };
    case 'RECEIVE':
      return { label: 'Получена', color: 'blue', variant: 'outline' };
    case 'RECONCILE':
      return { label: 'Сверка', color: 'orange', variant: 'outline' };
    case 'PACK':
      return { label: 'Упаковка', color: 'orange', variant: 'solid' };
    case 'MERGE':
      return { label: 'Объединение', color: 'purple', variant: 'outline' };
    case 'IN_TRANSIT':
      return { label: 'В пути', color: 'purple', variant: 'solid' };
    case 'ON_DELIVERY':
      return { label: 'Доставка', color: 'blue', variant: 'solid' };
    case 'DELIVERED':
      return { label: 'Доставлена', color: 'green', variant: 'solid' };
    case 'ARCHIVED':
      return { label: 'Архив', color: 'gray', variant: 'outline' };
    case 'CANCELLED':
      return { label: 'Отменена', color: 'red', variant: 'solid' };
    default:
      return { label: status, color: 'gray', variant: 'outline' };
  }
}

export function getAccentColor(type: ChatType): 'green' | 'default' {
  return type === 'REQUEST' ? 'green' : 'default';
}





