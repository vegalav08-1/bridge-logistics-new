'use client';
import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { RTClient } from './ws';
import type { RTEvent, RTClientMessage } from './types';

type Ctx = {
  send: (msg: RTClientMessage) => void;
  client: RTClient | null;
};

const RTCtx = createContext<Ctx>({ send: () => {}, client: null });
export function useRealtime(){ return useContext(RTCtx); }

type Props = {
  wsUrl: string;
  getToken: () => Promise<string>;
  children: React.ReactNode;
  log?: boolean;
};

export function RealtimeProvider({ wsUrl, getToken, children, log }: Props) {
  const clientRef = useRef<RTClient | null>(null);

  useEffect(() => {
    const c = new RTClient({ url: wsUrl, getToken, log });
    clientRef.current = c;
    c.connect();
    return () => { c.close(); clientRef.current = null; };
  }, [wsUrl, getToken, log]);

  // Глобальный роутинг сообщений в CustomEvent-«шину» браузера
  useEffect(() => {
    const c = clientRef.current;
    if (!c) return;
    const off = c.on('message', (msg: RTEvent) => {
      window.dispatchEvent(new CustomEvent('rt:event', { detail: msg }));
    });
    return () => { off?.(); };
  }, [clientRef.current]);

  const value = useMemo<Ctx>(() => ({
    send: (msg) => clientRef.current?.send(msg),
    client: clientRef.current
  }), []);

  return <RTCtx.Provider value={value}>{children}</RTCtx.Provider>;
}


