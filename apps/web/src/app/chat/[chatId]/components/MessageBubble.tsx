'use client';
import { ChatMessage } from '@/lib/chat/messages';
import { AlertCircle, Check, Clock3, RotateCcw } from 'lucide-react';

type Props = {
  msg: ChatMessage;                 // kind='text'
  onRetry?: (id: string) => void;   // для failed
};

export default function MessageBubble({ msg, onRetry }: Props) {
  const mine = !!msg.isMine;

  return (
    <div className={`w-full flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        data-testid="msg-text"
        data-id={msg.id}
        className={[
          'max-w-[78%] rounded-2xl px-3.5 py-2.5 shadow-sm',
          mine ? 'bg-[var(--brand)] text-white' : 'bg-white border',
          msg.failed ? 'border-red-300' : '',
        ].join(' ')}
      >
        {/* Автор (не для своих) */}
        {!mine && (
          <div className="text-[11px] font-medium text-[var(--text-secondary)] mb-0.5">
            {msg.authorName}
          </div>
        )}

        {/* Текст */}
        <div className="whitespace-pre-wrap break-words text-[15px]">
          {renderWithMentions(msg.text || '')}
        </div>

        {/* Низ: время + статусы */}
        <div className={`mt-1.5 flex items-center gap-2 text-[11px] ${mine ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>
          <time dateTime={msg.createdAtISO}>{new Date(msg.createdAtISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
          {msg.pending && <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" /> queued</span>}
          {!msg.pending && !msg.failed && mine && <span className="inline-flex items-center gap-1"><Check className="h-3 w-3" /> sent</span>}
          {msg.failed && (
            <button data-testid="retry" className="inline-flex items-center gap-1 text-red-600" onClick={() => onRetry?.(msg.id)}>
              <AlertCircle className="h-3 w-3" /> failed <RotateCcw className="h-3 w-3 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function renderWithMentions(text: string) {
  // простая подсветка упоминаний @...
  const parts = text.split(/(@[^\s,.;!?]+)/g);
  return parts.map((p, i) =>
    p.startsWith('@') ? (
      <a key={i} className="underline underline-offset-2" href={`#mention-${p.slice(1)}`}>{p}</a>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}
