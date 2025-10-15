/* eslint-disable no-unused-vars */
import React from 'react';
import { ShipmentCard, ShipmentCardProps } from './ShipmentCard';

export interface ShipmentsFeedProps {
  items: ShipmentCardProps[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onItemClick?: (chatId: string) => void;
  emptyMessage?: string;
}

export function ShipmentsFeed(props: ShipmentsFeedProps) {
  const { items, loading = false, hasMore = false, onLoadMore, onItemClick, emptyMessage = 'Пока нет отгрузок или заявок' } = props;
  if (loading && items.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
             {items.map((item) => (
               <ShipmentCard
                 key={item.chatId}
                 {...item}
                 onClick={onItemClick}
               />
             ))}
      
      {hasMore && (
        <div className="text-center py-4">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-brand bg-white border border-brand rounded-md hover:bg-brand hover:text-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Загрузка...' : 'Загрузить ещё'}
          </button>
        </div>
      )}
    </div>
  );
}
