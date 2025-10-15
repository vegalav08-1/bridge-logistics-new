import React from 'react';
import { cn } from './utils/cn';

export interface StatusChipProps {
  status: string;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
}

const statusConfig = {
  REQUEST: { label: 'Запрос', color: 'bg-green-100 text-green-800 border-green-200' },
  NEW: { label: 'Новая отгрузка', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  RECEIVE: { label: 'Приёмка', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  RECONCILE: { label: 'Сверка', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  PACK: { label: 'Упаковка', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  MERGE: { label: 'Совмещение', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  IN_TRANSIT: { label: 'В пути', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  ON_DELIVERY: { label: 'К выдаче', color: 'bg-pink-100 text-pink-800 border-pink-200' },
  DELIVERED: { label: 'Выдано', color: 'bg-green-100 text-green-800 border-green-200' },
  ARCHIVED: { label: 'Архив', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  CANCELLED: { label: 'Отменено', color: 'bg-red-100 text-red-800 border-red-200' },
};

const sizeConfig = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function StatusChip({ 
  status, 
  progress, 
  size = 'md', 
  showProgress = false,
  className 
}: StatusChipProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ARCHIVED;
  const sizeClass = sizeConfig[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'inline-flex items-center rounded-full border font-medium',
          config.color,
          sizeClass
        )}
      >
        {config.label}
      </span>
      
      {showProgress && progress !== undefined && (
        <div className="flex items-center gap-1">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{progress}%</span>
        </div>
      )}
    </div>
  );
}