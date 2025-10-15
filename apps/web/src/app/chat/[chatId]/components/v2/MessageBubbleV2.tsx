'use client';
import type { Message } from '@/lib/chat2/types';

export default function MessageBubbleV2({
  message, isOwn, onPin, canPin
}:{
  message: Message;
  isOwn: boolean;
  onPin?: (messageId: string, pinned: boolean) => void;
  canPin: boolean;
}) {
  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
        isOwn 
          ? 'bg-[var(--brand)] text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
        {/* Заголовок сообщения */}
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs opacity-70">
            {formatTime(message.createdAtISO)}
            {message.editedAtISO && ' (ред.)'}
          </div>
          {canPin && (
            <button
              onClick={() => onPin?.(message.id, !message.pinned)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              {message.pinned ? '📌' : '📍'}
            </button>
          )}
        </div>

        {/* Текст сообщения */}
        {message.text && (
          <div className="whitespace-pre-wrap text-sm">
            {message.text}
          </div>
        )}

        {/* Упоминания */}
        {message.mentions && message.mentions.length > 0 && (
          <div className="mt-1 text-xs opacity-70">
            Упомянуты: {message.mentions.map(m => `@${m.userId}`).join(', ')}
          </div>
        )}

        {/* Файлы */}
        {message.files && message.files.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.files.map(file => (
              <div key={file.id} className="text-xs opacity-70">
                📎 {file.name} ({Math.round(file.size / 1024)}KB)
              </div>
            ))}
          </div>
        )}

        {/* Финансовая информация */}
        {message.finance && (
          <div className="mt-2 text-xs">
            <span className={`font-semibold ${message.finance.sign === '+' ? 'text-green-600' : 'text-red-600'}`}>
              {message.finance.sign}{message.finance.amount} {message.finance.currency}
            </span>
            {message.finance.note && (
              <div className="opacity-70">{message.finance.note}</div>
            )}
          </div>
        )}

        {/* Системная информация */}
        {message.systemType && (
          <div className="mt-1 text-xs opacity-70">
            Система: {message.systemType}
          </div>
        )}
      </div>
    </div>
  );
}

