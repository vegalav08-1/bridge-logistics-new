'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChatMessage, listMessages } from '@/lib/chat/messages';
import { chatBus, emitLocalText, emitLocalFile, emitAck, emitFail } from '@/lib/chat/bus';
import type { LocalFilePayload, LocalTextPayload } from '@/lib/chat/bus';
import { retryItem } from '@/lib/outbox/useOutbox';
import { useViewer } from '@/components/viewer/ViewerProvider';
import type { ChatMessagePayload, TypingPayload } from '@/lib/realtime/types';
import { REALTIME_V2_ENABLED } from '@/lib/flags';
import MessageBubble from './MessageBubble';
import AttachmentCardMini from './AttachmentCardMini';
import SystemCard from './SystemCard';

type Props = {
  chatId: string;
  onOpenAttachment?: (id: string) => void;
  onDownloadAttachment?: (id: string) => void;
  onOpenOffer?: (payload: any) => void;
  onOpenQR?: (payload: any) => void;
};

export default function MessageList({
  chatId,
  onOpenAttachment,
  onDownloadAttachment,
  onOpenOffer,
  onOpenQR,
}: Props) {
  const [items, setItems] = useState<ChatMessage[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { open } = useViewer();

  // первичная загрузка
  useEffect(() => {
    let mounted = true;
    setItems([]);
    setCursor(undefined);
    (async () => {
      setLoading(true);
      const page = await listMessages(chatId);
      if (!mounted) return;
      setItems(page.items.reverse());       // от старых к новым
      setCursor(page.prevCursor);
      setLoading(false);
      // скролл к низу
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 0);
    })();
    return () => { mounted = false; };
  }, [chatId]);

  // пагинация вверх
  useEffect(() => {
    if (!topSentinelRef.current || !cursor) return;
    const io = new IntersectionObserver(async (entries) => {
      if (entries.some(e => e.isIntersecting) && !loading) {
        setLoading(true);
        const prev = await listMessages(chatId, cursor);
        // запоминаем позицию прокрутки
        const firstVisible = document.querySelector('[data-msg-first-visible]');
        const anchorId = firstVisible?.getAttribute('data-msg-id');
        setItems(prevItems => [...prev.items.reverse(), ...prevItems]);
        setCursor(prev.prevCursor);
        setLoading(false);
        // восстановить позицию
        if (anchorId) {
          const el = document.querySelector(`[data-msg-id="${anchorId}"]`);
          el?.scrollIntoView({ block: 'start' });
        }
      }
    }, { rootMargin: '200px' });
    io.observe(topSentinelRef.current);
    return () => io.disconnect();
  }, [cursor, chatId, loading]);

  // обработка локальных событий
  useEffect(() => {
    function onLocalText(e: Event) {
      const { chatId: cid, tempId, text, createdAtISO } = (e as CustomEvent<LocalTextPayload>).detail;
      if (cid !== chatId) return;
      setItems(prev => [...prev, {
        id: tempId, kind: 'text', chatId,
        createdAtISO, text, isMine: true, pending: true
      }]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    }
    function onLocalFile(e: Event) {
      const { chatId: cid, tempId, file, createdAtISO } = (e as CustomEvent<LocalFilePayload>).detail;
      if (cid !== chatId) return;
      setItems(prev => [...prev, {
        id: tempId, kind: 'attachment', chatId,
        createdAtISO, isMine: true, pending: true,
        attachment: { id: tempId, name: file.name, size: file.size, mime: file.type || 'application/octet-stream' }
      }]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    }
    function onAck(e: Event) {
      const { chatId: cid, tempId, serverId } = (e as CustomEvent<any>).detail;
      if (cid !== chatId) return;
      setItems(prev => prev.map(m => m.id === tempId ? { ...m, id: serverId, pending: false, failed: false } : m));
    }
    function onFail(e: Event) {
      const { chatId: cid, tempId } = (e as CustomEvent<any>).detail;
      if (cid !== chatId) return;
      setItems(prev => prev.map(m => m.id === tempId ? { ...m, pending: false, failed: true } : m));
    }
    function onRemoteMessage(e: Event) {
      const d = (e as CustomEvent<ChatMessagePayload>).detail;
      if (d.chatId !== chatId) return;
      setItems(prev => [
        ...prev,
        {
          id: d.id,
          kind: d.kind,
          chatId: d.chatId,
          createdAtISO: d.createdAtISO,
          authorId: d.authorId,
          authorName: d.authorName,
          isMine: false,
          text: d.text,
          attachment: d.attachment ? {
            id: d.attachment.id, name: d.attachment.name, size: d.attachment.size, mime: d.attachment.mime, thumbUrl: d.attachment.thumbUrl
          } : undefined
        }
      ]);
      setTimeout(()=>bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 0);
    }

    chatBus.addEventListener('local-text', onLocalText);
    chatBus.addEventListener('local-file', onLocalFile);
    chatBus.addEventListener('ack', onAck);
    chatBus.addEventListener('fail', onFail);
    chatBus.addEventListener('remote-message', onRemoteMessage);
    return () => {
      chatBus.removeEventListener('local-text', onLocalText);
      chatBus.removeEventListener('local-file', onLocalFile);
      chatBus.removeEventListener('ack', onAck);
      chatBus.removeEventListener('fail', onFail);
      chatBus.removeEventListener('remote-message', onRemoteMessage);
    };
  }, [chatId]);

  // Обработка typing индикации
  useEffect(() => {
    if (!REALTIME_V2_ENABLED) return;
    
    const on = (e: Event) => {
      const ev = (e as CustomEvent).detail as { type: string; data: any };
      if (ev.type === 'presence.typing') {
        const d = ev.data as TypingPayload;
        if (d.chatId !== chatId) return;
        
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u !== d.userName);
          if (new Date(d.untilISO) > new Date()) {
            return [...filtered, d.userName || d.userId];
          }
          return filtered;
        });
      }
    };
    
    window.addEventListener('rt:event', on);
    return () => window.removeEventListener('rt:event', on);
  }, [chatId]);

  // помечаем первый рендеримый элемент
  const decorated = useMemo(() => {
    return items.map((m, i) => ({ ...m, _first: i === 0 }));
  }, [items]);

  return (
    <div data-testid="message-list" className="px-3 py-2 space-y-2 overflow-y-auto h-full">
      {/* sentinel для пагинации вверх */}
      <div ref={topSentinelRef} />
      {decorated.map((m) => (
        <div
          key={m.id}
          data-msg-id={m.id}
          {...(m._first ? { 'data-msg-first-visible': true } : {})}
        >
          {m.kind === 'text' && (
            <MessageBubble
              msg={m}
              onRetry={(id) => retryItem(id)}
            />
          )}
          {m.kind === 'attachment' && m.attachment && (
            <AttachmentCardMini
              file={m.attachment}
              align={m.isMine ? 'right' : 'left'}
              onOpen={(id) => open(id)}
              onDownload={onDownloadAttachment}
            />
          )}
          {m.kind === 'system' && (
            <SystemCard
              msg={m}
              onOpenOffer={onOpenOffer}
              onOpenQR={onOpenQR}
            />
          )}
        </div>
      ))}
      {loading && (
        <>
          <div className="h-16 rounded-xl bg-[var(--muted)] animate-pulse" />
          <div className="h-16 rounded-xl bg-[var(--muted)] animate-pulse" />
        </>
      )}
      {/* Typing индикация */}
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] px-3 py-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-[var(--brand)] rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-[var(--brand)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-[var(--brand)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
          <span>{typingUsers.join(', ')} печатает...</span>
        </div>
      )}
      {/* низ ленты */}
      <div ref={bottomRef} data-testid="message-bottom" />
      <div className="h-2" />
    </div>
  );
}
