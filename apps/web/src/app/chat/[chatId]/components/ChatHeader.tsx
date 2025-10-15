'use client';

import React from 'react';
import { cx } from '@/lib/cx';
import { ChatHeaderVM, Role } from '@/lib/chat/types';
import { STATUS_LABEL, STATUS_COLOR } from '@/lib/chat/status-map';
import { StatusProgress } from './StatusProgress';
import { StatusActions } from './StatusActions';
import { 
  ArrowLeft, 
  QrCode, 
  Search, 
  Bell, 
  Info 
} from '@/components/icons';
import LineageBadge from '@/components/lineage/LineageBadge';
import { LINEAGE_V2_ENABLED } from '@/lib/flags';

export interface ChatHeaderProps {
  data: ChatHeaderVM;
  role: Role;
  onBack?: () => void;
  onOpenQR?: () => void;
  onOpenSearch?: () => void;
  onOpenInfo?: () => void;
  onAction?: (key: string) => void;
  disabledActions?: string[];
  className?: string;
  onAcceptFull?: () => void;
  onAcceptPartial?: () => void;
}

export function ChatHeader({
  data,
  role,
  onBack,
  onOpenQR,
  onOpenSearch,
  onOpenInfo,
  onAction,
  disabledActions,
  className,
  onAcceptFull,
  onAcceptPartial
}: ChatHeaderProps) {
  const handleAction = (key: string) => {
    if (onAction) {
      onAction(key);
    }
  };

  return (
    <div className={cx('sticky top-0 z-40 bg-surface border-b border-border', className)}>
      {/* Top row: Back button, number, action icons - minimal height */}
      <div className="flex items-center justify-between px-3 py-1">
        <div className="flex items-center space-x-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 -ml-1 rounded-lg hover:bg-muted transition-colors"
              aria-label="Назад"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold text-text">{data.number}</h1>
            <div className={cx(
              'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium',
              STATUS_COLOR[data.status]
            )}>
              {STATUS_LABEL[data.status]}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {LINEAGE_V2_ENABLED && (
            <LineageBadge 
              count={0} 
              onClick={() => {
                // Открываем lineage панель через событие
                window.dispatchEvent(new CustomEvent('open-lineage'));
              }} 
            />
          )}
          {data.qrAvailable && onOpenQR && (
            <button
              onClick={onOpenQR}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              aria-label="Показать QR-код"
            >
              <QrCode className="h-4 w-4" />
            </button>
          )}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              aria-label="Поиск сообщений"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
          {onOpenInfo && (
            <button
              onClick={onOpenInfo}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              aria-label="Показать информацию"
            >
              <Info className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Second row: Title and subtitle - minimal */}
      <div className="px-3 pb-1">
        <h2 className="text-xs font-medium text-text line-clamp-1">
          {data.title}
        </h2>
        {data.subtitle && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {data.subtitle}
          </p>
        )}
      </div>

      {/* Third row: Status progress - minimal */}
      <div className="px-3 pb-2">
        <StatusProgress status={data.status} />
      </div>

      {/* Fourth row: Accept buttons for NEW status - только для администраторов */}
      {data.status === 'NEW' && role === 'ADMIN' && onAcceptFull && onAcceptPartial && (
        <div className="px-3 pb-2">
          <div className="flex gap-2">
            <button 
              className="h-8 px-3 rounded-lg bg-green-500 text-white text-sm hover:bg-green-600 transition-colors flex items-center space-x-1" 
              onClick={onAcceptFull}
            >
              <span>✅</span>
              <span>Принять полностью</span>
            </button>
            <button 
              className="h-8 px-3 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600 transition-colors flex items-center space-x-1" 
              onClick={onAcceptPartial}
            >
              <span>⚠️</span>
              <span>Принять частично</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
