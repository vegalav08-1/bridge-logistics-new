'use client';
import { useState } from 'react';
import { createLinkSchema } from '@/lib/partners/schema';
import { createReferralLink } from '@/lib/partners/api';

export default function CreateLinkDialog({ 
  open, 
  onClose 
}: { 
  open: boolean; 
  onClose: () => void; 
}) {
  const [note, setNote] = useState('');
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  
  if (!open) return null;
  
  const make = async () => {
    setBusy(true);
    const z = createLinkSchema.safeParse({ note });
    if (!z.success) {
      setBusy(false);
      return;
    }
    const res = await createReferralLink(z.data.note);
    const full = `${location.origin}/r/${res.token}`;
    setUrl(full);
    try {
      await navigator.clipboard?.writeText(full);
    } catch {}
    setBusy(false);
  };
  
  return (
    <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center">
      <div className="w-[520px] max-w-[95vw] bg-white rounded-2xl p-4 space-y-3">
        <div className="text-lg font-semibold">Create referral link</div>
        <input 
          className="h-11 rounded-xl border px-3" 
          placeholder="Note (optional)" 
          value={note} 
          onChange={e => setNote(e.target.value)} 
        />
        {url && (
          <div className="rounded-xl border px-3 py-2 text-sm break-all">
            {url}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button 
            className="h-10 px-3 rounded-xl border" 
            onClick={onClose}
          >
            Close
          </button>
          <button 
            className="h-10 px-3 rounded-xl bg-[var(--brand)] text-white" 
            onClick={make} 
            disabled={busy}
          >
            Create & Copy
          </button>
        </div>
      </div>
    </div>
  );
}

