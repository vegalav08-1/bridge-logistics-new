'use client';

import React from 'react';
import { Clock, User, Package, ArrowRight, Split, Merge } from 'lucide-react';

export interface SystemCardProps {
  type: 'status_change' | 'partial_op' | 'split_merge';
  data: any;
  className?: string;
}

export function SystemCard({ type, data, className }: SystemCardProps) {
  const baseClasses = "bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm";
  
  switch (type) {
    case 'status_change':
      return <StatusChangeCard data={data} className={className} />;
    case 'partial_op':
      return <PartialOpCard data={data} className={className} />;
    case 'split_merge':
      return <SplitMergeCard data={data} className={className} />;
    default:
      return null;
  }
}

function StatusChangeCard({ data, className }: { data: any; className?: string }) {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm ${className}`}>
      <div className="flex items-center gap-2 text-blue-700">
        <Clock className="h-4 w-4" />
        <span className="font-medium">Изменение статуса</span>
      </div>
      <div className="mt-2 text-gray-700">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
            {data.from}
          </span>
          <ArrowRight className="h-3 w-3 text-gray-400" />
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
            {data.to}
          </span>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          {data.by} • {new Date(data.atISO).toLocaleString('ru')}
        </div>
        {data.comment && (
          <div className="mt-2 text-gray-600 italic">"{data.comment}"</div>
        )}
      </div>
    </div>
  );
}

function PartialOpCard({ data, className }: { data: any; className?: string }) {
  const isReceive = data.key === 'receive_partial';
  const icon = isReceive ? Package : User;
  const title = isReceive ? 'Частичный приём' : 'Частичная доставка';
  const color = isReceive ? 'green' : 'orange';
  
  return (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-xl p-4 text-sm ${className}`}>
      <div className={`flex items-center gap-2 text-${color}-700`}>
        {React.createElement(icon, { className: "h-4 w-4" })}
        <span className="font-medium">{title}</span>
      </div>
      <div className="mt-2 text-gray-700">
        {data.lines && data.lines.length > 0 && (
          <div className="space-y-1">
            {data.lines.map((line: any, index: number) => (
              <div key={index} className="flex justify-between text-xs">
                <span>{line.name || `Позиция ${line.id}`}</span>
                <span className="font-medium">
                  {isReceive ? line.qtyAccepted : line.qtyDelivered} шт.
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 text-xs text-gray-500">
          {data.by} • {new Date(data.atISO).toLocaleString('ru')}
        </div>
        {data.comment && (
          <div className="mt-2 text-gray-600 italic">"{data.comment}"</div>
        )}
      </div>
    </div>
  );
}

function SplitMergeCard({ data, className }: { data: any; className?: string }) {
  const isSplit = data.key === 'split';
  const icon = isSplit ? Split : Merge;
  const title = isSplit ? 'Разделение отгрузки' : 'Объединение отгрузок';
  const color = isSplit ? 'purple' : 'blue';
  
  return (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-xl p-4 text-sm ${className}`}>
      <div className={`flex items-center gap-2 text-${color}-700`}>
        {React.createElement(icon, { className: "h-4 w-4" })}
        <span className="font-medium">{title}</span>
      </div>
      <div className="mt-2 text-gray-700">
        {isSplit ? (
          <div>
            <div className="text-xs text-gray-500 mb-1">Создана новая отгрузка:</div>
            <div className="font-medium">{data.newTitle || 'Новая отгрузка'}</div>
            {data.picks && data.picks.length > 0 && (
              <div className="mt-2 space-y-1">
                {data.picks.map((pick: any, index: number) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span>{pick.name || `Позиция ${pick.id}`}</span>
                    <span className="font-medium">{pick.qty} шт.</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="text-xs text-gray-500 mb-1">Присоединена отгрузка:</div>
            <div className="font-medium">{data.targetChatId}</div>
            {data.picks && data.picks.length > 0 && (
              <div className="mt-2 space-y-1">
                {data.picks.map((pick: any, index: number) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span>{pick.name || `Позиция ${pick.id}`}</span>
                    <span className="font-medium">{pick.qty} шт.</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="mt-2 text-xs text-gray-500">
          {data.by} • {new Date(data.atISO).toLocaleString('ru')}
        </div>
      </div>
    </div>
  );
}

// Экспорт отдельных карточек для использования в MessageList
export { StatusChangeCard, PartialOpCard, SplitMergeCard };


