'use client';
import type { Message } from '@/lib/chat2/types';

export default function SystemCardV2({
  message
}:{
  message: Message;
}) {
  if (message.kind !== 'system') return null;

  const getSystemIcon = (systemType?: string) => {
    switch (systemType) {
      case 'status': return '🔄';
      case 'cr': return '📝';
      case 'wms': return '📦';
      case 'carrier': return '🚚';
      case 'merge': return '🔗';
      case 'split': return '✂️';
      case 'qr': return '📱';
      case 'audit': return '📊';
      default: return 'ℹ️';
    }
  };

  const getSystemColor = (systemType?: string) => {
    switch (systemType) {
      case 'status': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'cr': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'wms': return 'bg-green-50 border-green-200 text-green-800';
      case 'carrier': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'merge': return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'split': return 'bg-red-50 border-red-200 text-red-800';
      case 'qr': return 'bg-gray-50 border-gray-200 text-gray-800';
      case 'audit': return 'bg-slate-50 border-slate-200 text-slate-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`flex justify-center mb-2`}>
      <div className={`rounded-xl border px-3 py-2 max-w-[80%] ${getSystemColor(message.systemType)}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{getSystemIcon(message.systemType)}</span>
          <div className="text-sm">
            {message.text}
          </div>
        </div>
        {message.finance && (
          <div className="mt-1 text-xs">
            <span className={`font-semibold ${message.finance.sign === '+' ? 'text-green-600' : 'text-red-600'}`}>
              {message.finance.sign}{message.finance.amount} {message.finance.currency}
            </span>
            {message.finance.note && (
              <div className="opacity-70">{message.finance.note}</div>
            )}
          </div>
        )}
        <div className="text-xs opacity-70 mt-1">
          {new Date(message.createdAtISO).toLocaleString('ru-RU')}
        </div>
      </div>
    </div>
  );
}

