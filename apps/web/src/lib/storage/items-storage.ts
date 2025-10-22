'use client';

import type { ItemInput } from '@/lib/forms/validators';

const ITEMS_STORAGE_KEY = 'shipment-items';
const ITEMS_BACKUP_KEY = 'shipment-items-backup';

export interface ItemsStorageData {
  items: ItemInput[];
  lastUpdated: number;
}

/**
 * Сохраняет данные товаров в localStorage и sessionStorage (как резерв)
 */
export function saveItemsToStorage(items: ItemInput[]): void {
  try {
    const data: ItemsStorageData = {
      items,
      lastUpdated: Date.now()
    };

    // Основное хранение в localStorage
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(data));
    
    // Резервное хранение в sessionStorage
    sessionStorage.setItem(ITEMS_BACKUP_KEY, JSON.stringify(data));
    
    console.log('✅ Товары сохранены в localStorage и sessionStorage');
  } catch (error) {
    console.error('❌ Ошибка сохранения товаров:', error);
  }
}

/**
 * Загружает данные товаров из localStorage или sessionStorage (как резерв)
 */
export function loadItemsFromStorage(): ItemInput[] {
  try {
    // Сначала пытаемся загрузить из localStorage
    const stored = localStorage.getItem(ITEMS_STORAGE_KEY);
    if (stored) {
      const data: ItemsStorageData = JSON.parse(stored);
      console.log('✅ Товары загружены из localStorage');
      return data.items || [];
    }

    // Если в localStorage нет данных, пробуем sessionStorage
    const backup = sessionStorage.getItem(ITEMS_BACKUP_KEY);
    if (backup) {
      const data: ItemsStorageData = JSON.parse(backup);
      console.log('✅ Товары загружены из sessionStorage (резерв)');
      // Восстанавливаем в localStorage
      localStorage.setItem(ITEMS_STORAGE_KEY, backup);
      return data.items || [];
    }

    console.log('ℹ️ Данные товаров не найдены, возвращаем пустой массив');
    return [];
  } catch (error) {
    console.error('❌ Ошибка загрузки товаров:', error);
    return [];
  }
}

/**
 * Очищает сохраненные данные товаров
 */
export function clearItemsStorage(): void {
  try {
    localStorage.removeItem(ITEMS_STORAGE_KEY);
    sessionStorage.removeItem(ITEMS_BACKUP_KEY);
    console.log('✅ Данные товаров очищены');
  } catch (error) {
    console.error('❌ Ошибка очистки данных товаров:', error);
  }
}

/**
 * Проверяет, есть ли сохраненные данные товаров
 */
export function hasStoredItems(): boolean {
  try {
    return localStorage.getItem(ITEMS_STORAGE_KEY) !== null || 
           sessionStorage.getItem(ITEMS_BACKUP_KEY) !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Получает время последнего обновления товаров
 */
export function getItemsLastUpdated(): number | null {
  try {
    const stored = localStorage.getItem(ITEMS_STORAGE_KEY);
    if (stored) {
      const data: ItemsStorageData = JSON.parse(stored);
      return data.lastUpdated;
    }
    return null;
  } catch (error) {
    return null;
  }
}
