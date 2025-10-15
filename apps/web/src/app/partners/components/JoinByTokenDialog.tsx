'use client';
import { useState } from 'react';
import { joinByTokenSchema } from '@/lib/partners/schema';
import { joinByReferral } from '@/lib/partners/api';
import { usePartners } from '@/lib/partners/usePartners';

export default function JoinByTokenDialog({ 
  open, 
  onClose 
}: { 
  open: boolean; 
  onClose: () => void; 
}) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const { load } = usePartners();
  
  if (!open) return null;
  
  const join = async () => {
    const z = joinByTokenSchema.safeParse({ urlOrToken: val.trim() });
    if (!z.success) {
      setErr('Введите ссылку или токен');
      return;
    }
    setBusy(true);
    try {
      const token = z.data.urlOrToken.split('/').pop()!;
      await joinByReferral(token);
      await load();
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? 'Не удалось присоединиться');
    } finally {
      setBusy(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center">
      <div className="w-[520px] max-w-[95vw] bg-white rounded-2xl p-4 space-y-3">
        <div className="text-lg font-semibold">Add admin by referral link</div>
        <input 
          className="h-11 rounded-xl border px-3" 
          placeholder="Paste link or token" 
          value={val} 
          onChange={e => setVal(e.target.value)} 
        />
        {err && (
          <div className="text-sm text-red-600">{err}</div>
        )}
        <div className="flex justify-end gap-2">
          <button 
            className="h-10 px-3 rounded-xl border" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="h-10 px-3 rounded-xl bg-[var(--brand)] text-white" 
            onClick={join} 
            disabled={busy}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

