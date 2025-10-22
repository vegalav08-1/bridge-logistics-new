'use client';
import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import type { ItemInput } from '@/lib/forms/validators';
import MultiPhotoThumbnail from './MultiPhotoThumbnail';
import { saveItemsToStorage, loadItemsFromStorage, clearItemsStorage } from '@/lib/storage/items-storage';

interface ItemsListProps {
  items: ItemInput[];
  onChange: (items: ItemInput[]) => void;
  onTotalCostChange: (totalCost: number) => void;
  errors?: Record<string, string>;
}

export default function ItemsList({ items, onChange, onTotalCostChange, errors }: ItemsListProps) {
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Загружаем сохраненные данные при инициализации
  useEffect(() => {
    if (!isInitialized && typeof window !== 'undefined') {
      const savedItems = loadItemsFromStorage();
      if (savedItems.length > 0) {
        console.log('🔄 Восстанавливаем сохраненные товары:', savedItems);
        onChange(savedItems);
      }
      setIsInitialized(true);
    }
  }, [isInitialized, onChange]);

  // Сохраняем данные при изменении товаров
  useEffect(() => {
    if (isInitialized && items.length > 0) {
      saveItemsToStorage(items);
    }
  }, [items, isInitialized]);

  // Инициализируем расчет общей стоимости при загрузке
  useEffect(() => {
    calculateTotalCost(items);
  }, [items]);

  // Отслеживаем монтирование компонента
  useEffect(() => {
    setMounted(true);
  }, []);

  const addItem = () => {
    const newItem: ItemInput = {
      id: `item_${Date.now()}`,
      name: '',
      quantity: 1,
      price: 0,
      oldTracking: '',
      photos: [],
    };
    onChange([...(items || []), newItem]);
  };

  const removeItem = (id: string) => {
    const newItems = (items || []).filter(item => item.id !== id);
    onChange(newItems);
    calculateTotalCost(newItems);
    
    // Если товаров не осталось, очищаем хранилище
    if (newItems.length === 0) {
      clearItemsStorage();
    }
  };

  const updateItem = (id: string, field: keyof ItemInput, value: any) => {
    const newItems = (items || []).map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange(newItems);
    calculateTotalCost(newItems);
  };

  const calculateTotalCost = (itemsList: ItemInput[]) => {
    const total = (itemsList || []).reduce((sum, item) => sum + (item.quantity * item.price), 0);
    onTotalCostChange(total);
  };

  const toggleCollapse = (itemId: string) => {
    setCollapsedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const isItemCollapsed = (itemId: string) => collapsedItems.has(itemId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Товары</h3>
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1 px-2 py-1 bg-[var(--brand)] text-white rounded-md hover:bg-[var(--brand-dark)] transition-all duration-200 hover:scale-[1.02] text-sm"
        >
          <Plus className="h-3 w-3" />
          Добавить товар
        </button>
      </div>

      {mounted && (items || []).map((item, index) => {
        const isCollapsed = isItemCollapsed(item.id);
        const hasContent = item.name.trim() || item.quantity > 0 || item.price > 0;
        
        return (
          <div 
            key={item.id} 
            className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Шапка товара - кликабельная для открытия/закрытия */}
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleCollapse(item.id)}
            >
              <div className="flex items-start gap-3">
                {/* Фото товара */}
                <div className="flex-shrink-0">
                  <MultiPhotoThumbnail
                    photos={item.photos || []}
                    onPhotosChange={(photos) => updateItem(item.id, 'photos', photos)}
                    maxPhotos={3}
                    itemId={item.id}
                  />
                </div>

                {/* Основная информация */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {mounted && item.name ? item.name : `Товар ${index + 1}`}
                      </h4>
                      <div className="text-xs text-gray-500 mt-1">
                      {item.quantity} шт. × {item.price > 0 ? item.price.toLocaleString('ru-RU') : '0'} ₽ = <span className="font-semibold text-green-600">{item.price > 0 ? (item.quantity * item.price).toLocaleString('ru-RU') : '0'} ₽</span>
                    </div>
                    {item.oldTracking && (
                      <div className="text-xs text-blue-600 mt-1">
                        Трек: {item.oldTracking}
                      </div>
                    )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCollapse(item.id);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                        title={isCollapsed ? 'Развернуть' : 'Свернуть'}
                      >
                        {isCollapsed ? (
                          <ChevronRight className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      {(items || []).length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item.id);
                          }}
                          className="p-2 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title="Удалить товар"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            {/* Содержимое товара - сворачиваемое, НЕ кликабельное для открытия/закрытия */}
            {!isCollapsed && (
              <div 
                className="mt-3 pt-3 border-t border-gray-100"
                onClick={(e) => e.stopPropagation()} // Предотвращаем всплытие клика
              >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Наименование *
                      </label>
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        className={`w-full h-8 rounded-lg border px-2 text-sm ${
                          errors?.[`items.${index}.name`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Название товара"
                      />
                      {(errors || {})[`items.${index}.name`] && (
                        <p className="text-red-500 text-xs mt-1">{(errors || {})[`items.${index}.name`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Старый трек-номер
                      </label>
                      <input
                        type="text"
                        value={item.oldTracking || ''}
                        onChange={(e) => updateItem(item.id, 'oldTracking', e.target.value)}
                        className="w-full h-8 rounded-lg border px-2 text-sm border-gray-300"
                        placeholder="LP123456789CN"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Количество *
                      </label>
                      <input
                        type="number"
                        value={item.quantity || ''}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                        className={`w-full h-8 rounded-lg border px-2 text-sm ${
                          errors?.[`items.${index}.quantity`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="1"
                        min="1"
                      />
                      {(errors || {})[`items.${index}.quantity`] && (
                        <p className="text-red-500 text-xs mt-1">{(errors || {})[`items.${index}.quantity`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Цена (₽) *
                      </label>
                      <input
                        type="number"
                        value={item.price || ''}
                        onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                        className={`w-full h-8 rounded-lg border px-2 text-sm ${
                          errors?.[`items.${index}.price`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0 ₽"
                        min="0"
                        step="0.01"
                      />
                      {(errors || {})[`items.${index}.price`] && (
                        <p className="text-red-500 text-xs mt-1">{(errors || {})[`items.${index}.price`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {(items || []).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Добавьте товары для отгрузки</p>
        </div>
      )}
    </div>
  );
}
