'use client';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import AttachmentViewer from './AttachmentViewer';

type ViewerCtx = {
  open: (attachmentId: string) => void;
  close: () => void;
};

const Ctx = createContext<ViewerCtx | null>(null);

export function useViewer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('ViewerProvider missing');
  return ctx;
}

export default function ViewerProvider({ children }: { children: React.ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useCallback((id: string) => setOpenId(id), []);
  const close = useCallback(() => setOpenId(null), []);
  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {/* портальный viewer поверх всего */}
      <AttachmentViewer attachmentId={openId} onClose={close} />
    </Ctx.Provider>
  );
}


