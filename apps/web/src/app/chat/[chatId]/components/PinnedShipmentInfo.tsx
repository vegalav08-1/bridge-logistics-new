'use client';

import { Package, ArrowDown } from 'lucide-react';
import { cx } from '@/lib/cx';

interface PinnedShipmentInfoProps {
  chatId: string;
  className?: string;
}

export function PinnedShipmentInfo({ chatId, className }: PinnedShipmentInfoProps) {
  // Мок данные для отгрузки
  const shipmentData = {
    id: `BR-${chatId.slice(-6).toUpperCase()}`,
    status: 'NEW',
    title: 'Электронные компоненты для производства',
    createdAt: '2024-01-15T10:30:00Z'
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_TRANSIT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Функция для прокрутки к системному сообщению
  const scrollToShipmentMessage = () => {
    // Ищем системное сообщение с информацией об отгрузке
    const shipmentMessage = document.querySelector('[data-shipment-info]');
    if (shipmentMessage) {
      shipmentMessage.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    } else {
      // Если сообщение не найдено, прокручиваем к началу чата
      const chatContainer = document.querySelector('.flex-1.min-h-0.overflow-y-auto');
      if (chatContainer) {
        chatContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className={cx(
      'sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm',
      className
    )}>
      {/* Компактная версия (всегда видимая) */}
      <div 
        className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={scrollToShipmentMessage}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-gray-900">
                  📦 {shipmentData.id}
                </span>
                <span className={cx(
                  'px-2 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(shipmentData.status)
                )}>
                  Новый
                </span>
              </div>
              
              <div className="text-xs text-gray-600 truncate">
                {shipmentData.title}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-xs text-gray-500">
              {formatDate(shipmentData.createdAt)}
            </div>
            <ArrowDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
