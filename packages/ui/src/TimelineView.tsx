import React from 'react';
import { cn } from './utils/cn';

export interface TimelineItem {
  id: string;
  type: 'message' | 'transition' | 'action';
  timestamp: string;
  data: any;
}

export interface TimelineViewProps {
  items: TimelineItem[];
  className?: string;
}

const getItemIcon = (type: string, data: any) => {
  switch (type) {
    case 'transition':
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
      );
    
    case 'action':
      const actionIcon = {
        'receive.full': '✅',
        'receive.partial': '⚠️',
        'reconcile.create': '📋',
        'reconcile.confirm': '✓',
        'pack.configure': '📦',
        'pack.complete': '📦',
        'merge.attach': '🔗',
        'merge.detach': '🔓',
        'merge.complete': '🔗',
        'arrival.city': '🏙️',
        'handover.confirm': '📤',
        'cancel': '❌',
        'archive': '📁',
      };
      
      return (
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg">
          {actionIcon[data.action as keyof typeof actionIcon] || '⚙️'}
        </div>
      );
    
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      );
  }
};

const getItemTitle = (type: string, data: any) => {
  switch (type) {
    case 'transition':
      return `Переход: ${data.from} → ${data.to}`;
    
    case 'action':
      const actionLabels = {
        'receive.full': 'Груз принят полностью',
        'receive.partial': 'Груз принят частично',
        'reconcile.create': 'Создана сверка',
        'reconcile.confirm': 'Сверка подтверждена',
        'pack.configure': 'Настроена упаковка',
        'pack.complete': 'Упаковка завершена',
        'merge.attach': 'Отгрузка присоединена',
        'merge.detach': 'Отгрузка отсоединена',
        'merge.complete': 'Совмещение завершено',
        'arrival.city': 'Прибыло в город',
        'handover.confirm': 'Выдача подтверждена',
        'cancel': 'Отменено',
        'archive': 'Архивировано',
      };
      
      return actionLabels[data.action as keyof typeof actionLabels] || data.action;
    
    default:
      return 'Сообщение';
  }
};

const getItemDescription = (type: string, data: any) => {
  switch (type) {
    case 'transition':
      return data.reason || 'Изменение статуса';
    
    case 'action':
      if (data.payload) {
        if (data.action === 'receive.partial' && data.payload.missing) {
          return `Недостающие позиции: ${data.payload.missing.length}`;
        }
        if (data.action === 'reconcile.create' && data.payload.discrepancies) {
          return `Расхождения: ${data.payload.discrepancies.length}`;
        }
        if (data.action === 'arrival.city' && data.payload.city) {
          return `Город: ${data.payload.city}`;
        }
        if (data.action === 'handover.confirm' && data.payload.recipientName) {
          return `Получатель: ${data.payload.recipientName}`;
        }
        if (data.action === 'cancel' && data.payload.reason) {
          return `Причина: ${data.payload.reason}`;
        }
      }
      return 'Операция выполнена';
    
    default:
      return data.content || 'Сообщение в чате';
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) { // менее минуты
    return 'только что';
  } else if (diff < 3600000) { // менее часа
    const minutes = Math.floor(diff / 60000);
    return `${minutes} мин назад`;
  } else if (diff < 86400000) { // менее суток
    const hours = Math.floor(diff / 3600000);
    return `${hours} ч назад`;
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};

export function TimelineView({ items, className }: TimelineViewProps) {
  if (items.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>История пуста</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          {/* Иконка */}
          <div className="flex-shrink-0">
            {getItemIcon(item.type, item.data)}
          </div>
          
          {/* Контент */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                {getItemTitle(item.type, item.data)}
              </h4>
              <time className="text-xs text-gray-500">
                {formatTimestamp(item.timestamp)}
              </time>
            </div>
            
            <p className="text-sm text-gray-600 mt-1">
              {getItemDescription(item.type, item.data)}
            </p>
            
            {/* Дополнительная информация */}
            {item.data.by && (
              <p className="text-xs text-gray-500 mt-1">
                Выполнено: {item.data.by.email} ({item.data.by.role})
              </p>
            )}
          </div>
          
          {/* Соединительная линия */}
          {index < items.length - 1 && (
            <div className="absolute left-4 top-12 w-0.5 h-8 bg-gray-200" />
          )}
        </div>
      ))}
    </div>
  );
}
