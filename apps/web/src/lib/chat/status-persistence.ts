import { ShipmentStatus } from './types';

const STATUS_STORAGE_KEY = 'shipment_statuses';

export interface ShipmentStatusData {
  chatId: string;
  status: ShipmentStatus;
  updatedAt: string;
  transitionData?: {
    action: string;
    payload: any;
  };
}

/**
 * Сохраняет статус отгрузки в localStorage
 */
export function saveShipmentStatus(chatId: string, status: ShipmentStatus, transitionData?: { action: string; payload: any }): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existingData = loadAllShipmentStatuses();
    const updatedData = {
      ...existingData,
      [chatId]: {
        chatId,
        status,
        updatedAt: new Date().toISOString(),
        transitionData
      }
    };
    
    localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(updatedData));
    console.log(`Статус отгрузки ${chatId} сохранен: ${status}`);
  } catch (error) {
    console.error('Ошибка при сохранении статуса отгрузки:', error);
  }
}

/**
 * Загружает статус отгрузки из localStorage
 */
export function loadShipmentStatus(chatId: string): ShipmentStatusData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const allData = loadAllShipmentStatuses();
    return allData[chatId] || null;
  } catch (error) {
    console.error('Ошибка при загрузке статуса отгрузки:', error);
    return null;
  }
}

/**
 * Загружает все статусы отгрузок
 */
export function loadAllShipmentStatuses(): Record<string, ShipmentStatusData> {
  if (typeof window === 'undefined') return {};
  
  try {
    const data = localStorage.getItem(STATUS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Ошибка при загрузке всех статусов:', error);
    return {};
  }
}

/**
 * Удаляет статус отгрузки из localStorage
 */
export function removeShipmentStatus(chatId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const allData = loadAllShipmentStatuses();
    delete allData[chatId];
    localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(allData));
    console.log(`Статус отгрузки ${chatId} удален`);
  } catch (error) {
    console.error('Ошибка при удалении статуса отгрузки:', error);
  }
}

/**
 * Очищает все сохраненные статусы
 */
export function clearAllShipmentStatuses(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STATUS_STORAGE_KEY);
    console.log('Все статусы отгрузок очищены');
  } catch (error) {
    console.error('Ошибка при очистке статусов:', error);
  }
}

