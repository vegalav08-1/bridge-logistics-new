/* eslint-disable no-unused-vars */
import React from 'react';
import { StatusChip } from './StatusChip';

export interface ShipmentCardProps {
  chatId: string;
  number: string;
  type: 'REQUEST' | 'SHIPMENT';
  status: string;
  updatedAt: string;
  preview: {
    title: string;
    subtitle: string;
    labels: string[];
  };
  badges: string[];
  accent: 'green' | 'default';
  onClick?: (chatId: string) => void;
}

export function ShipmentCard(props: ShipmentCardProps) {
  const { chatId, number, type, status, updatedAt, preview, accent, onClick } = props;
  
  const handleClick = () => {
    if (onClick) {
      onClick(chatId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'только что';
    if (diffMinutes < 60) return `${diffMinutes} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getAccentClasses = () => {
    return accent === 'green' 
      ? 'ring-1 ring-green-500/60 border-green-200' 
      : 'border-gray-200';
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border ${getAccentClasses()} p-4 cursor-pointer hover:shadow-md transition-shadow min-h-[88px]`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800">#{number || 'N/A'}</h3>
        <div className="flex items-center space-x-2">
          <StatusChip status={status || 'UNKNOWN'} size="sm" />
          <span className="text-sm text-gray-500">{formatDate(updatedAt || new Date().toISOString())}</span>
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-gray-900 text-sm font-medium line-clamp-1">
          {preview?.title || 'Без заголовка'}
        </p>
        {preview?.subtitle && (
          <p className="text-gray-600 text-sm line-clamp-1">
            {preview.subtitle}
          </p>
        )}
        {preview?.labels && preview.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {preview.labels.map((label, index) => (
              <span
                key={index}
                className="inline-block px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded"
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}