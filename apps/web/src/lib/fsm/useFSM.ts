'use client';
import { useCallback, useMemo, useRef, useState } from 'react';
import { applyOptimistic, rollback, isConflict } from './apply';
import { postReceivePartial, postDeliverPartial, postTransition, postSplit, postMergeAttach, postMergeDetach, fetchLines } from './api';
import { v4 as uuid } from 'uuid';
import type { LinesState, ShipmentStatus } from './types';

export function useFSM(chatId: string, initialStatus: ShipmentStatus) {
  const [status, setStatus] = useState<ShipmentStatus>(initialStatus);
  const [lines, setLines] = useState<LinesState|null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const serverVersion = useRef<number>(1);

  const loadLines = useCallback(async () => {
    const data = await fetchLines(chatId);
    serverVersion.current = data.version;
    setLines(data);
  }, [chatId]);

  const run = useCallback(async (key: 'receive_partial'|'deliver_partial'|'arrive_to_city'|'deliver_full'|'cancel', payload?: any) => {
    setError(null); setBusy(true);
    const idem = uuid();
    const prev = lines && { status, version: serverVersion.current, lines };
    try {
      // оптимистично для частичных операций
      if (lines && (key === 'receive_partial' || key === 'deliver_partial')) {
        const next = applyOptimistic({ status, version: serverVersion.current, lines }, key, payload);
        setLines(next.lines);
      }
      const res =
        key === 'receive_partial' ? await postReceivePartial(chatId, payload, idem) :
        key === 'deliver_partial' ? await postDeliverPartial(chatId, payload, idem) :
        await postTransition(chatId, key, payload, idem);

      if (isConflict(res.version, serverVersion.current)) {
        // в конфликте перезагружаем линии
        await loadLines();
      }
      serverVersion.current = res.version;
      setStatus(res.status);
      // TODO: вставить system-card в ленту (см. ниже)
    } catch (e:any) {
      setError(e?.message ?? 'Ошибка операции');
      if (prev) setLines(prev.lines); // откат
    } finally {
      setBusy(false);
    }
  }, [chatId, lines, status, loadLines]);

  const split = useCallback(async (payload: any) => {
    setBusy(true); setError(null);
    try {
      const idem = uuid();
      const res = await postSplit(chatId, payload, idem);
      serverVersion.current = res.version;
      // TODO: system-card + редирект при необходимости
      return res.newChatId;
    } catch (e:any) { setError(e?.message ?? 'Ошибка split'); }
    finally { setBusy(false); }
  }, [chatId]);

  const mergeAttach = useCallback(async (payload: any) => {
    setBusy(true); setError(null);
    try {
      const idem = uuid();
      const res = await postMergeAttach(chatId, payload, idem);
      serverVersion.current = res.version;
    } catch (e:any) { setError(e?.message ?? 'Ошибка merge attach'); }
    finally { setBusy(false); }
  }, [chatId]);

  const mergeDetach = useCallback(async (targetChatId: string) => {
    setBusy(true); setError(null);
    try {
      const idem = uuid();
      const res = await postMergeDetach(chatId, targetChatId, idem);
      serverVersion.current = res.version;
    } catch (e:any) { setError(e?.message ?? 'Ошибка merge detach'); }
    finally { setBusy(false); }
  }, [chatId]);

  return useMemo(()=>({
    status, lines, busy, error, loadLines,
    run, split, mergeAttach, mergeDetach
  }), [status, lines, busy, error, loadLines, run, split, mergeAttach, mergeDetach]);
}


