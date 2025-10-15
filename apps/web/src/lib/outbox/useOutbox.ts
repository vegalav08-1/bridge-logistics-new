'use client';
import { useCallback, useEffect, useRef } from 'react';
import { idbAdd, idbAllQueued, idbDelete, idbDeleteBlob, idbGet, idbGetBlob, idbPut } from './indexeddb';
import type { OutboxItem, OutboxText, OutboxFile } from './types';
import { apiSendText, apiUploadFile } from '@/lib/chat/send';
import { emitAck, emitFail } from '@/lib/chat/bus';
import { useNetwork } from './useNetwork';

const MAX_TRIES = 5;

export function useOutboxProcessor() {
  const online = useNetwork();
  const running = useRef(false);

  const process = useCallback(async () => {
    if (running.current || !online) return;
    running.current = true;
    try {
      const queued = await idbAllQueued();
      for (const it of queued as OutboxItem[]) {
        // mark sending
        it.status = 'sending';
        it.tries += 1;
        await idbPut(it);
        try {
          if (it.kind === 'text') {
            const t = it as OutboxText;
            const { serverId } = await apiSendText(t.chatId, t.text);
            await idbDelete(it.id);
            emitAck({ chatId: it.chatId, tempId: it.id, serverId });
          } else {
            const f = it as OutboxFile;
            const blob = await idbGetBlob(it.id);
            if (!blob) throw new Error('Blob not found');
            const { serverId } = await apiUploadFile(f.chatId, blob, f.fileName, f.fileType);
            await idbDeleteBlob(it.id);
            await idbDelete(it.id);
            emitAck({ chatId: it.chatId, tempId: it.id, serverId });
          }
        } catch (e: any) {
          // backoff: если превысили попытки — failed
          it.status = it.tries >= MAX_TRIES ? 'failed' : 'queued';
          it.lastError = e?.message ?? String(e);
          await idbPut(it);
          if (it.status === 'failed') emitFail({ chatId: it.chatId, tempId: it.id, error: it.lastError });
        }
      }
    } finally {
      running.current = false;
    }
  }, [online]);

  // Автозапуск при онлайн/фокусе
  useEffect(() => { if (online) process(); }, [online, process]);
  useEffect(() => {
    const onFocus = () => process();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [process]);

  return { process, online };
}

// --- публичные функции добавления сообщений в очередь ---
function uuid() { return 'tmp_' + Math.random().toString(36).slice(2); }

export async function queueText(chatId: string, text: string) {
  const id = uuid();
  const item: OutboxText = {
    id, chatId, text,
    createdAt: Date.now(),
    tries: 0,
    status: 'queued',
    kind: 'text',
  };
  await idbAdd(item);
  return id;
}

export async function queueFile(chatId: string, file: File) {
  const id = uuid();
  const item: OutboxFile = {
    id, chatId,
    fileName: file.name,
    fileType: file.type || 'application/octet-stream',
    fileSize: file.size,
    createdAt: Date.now(),
    tries: 0,
    status: 'queued',
    kind: 'file',
  };
  await idbAdd(item, file);
  return id;
}

export async function retryItem(id: string) {
  const it = await idbGet(id);
  if (!it) return;
  it.status = 'queued';
  await idbPut(it);
}


