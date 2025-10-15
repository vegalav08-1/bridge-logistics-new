'use client';
import { useState, useEffect } from 'react';
import { receivePartialSchema, type ReceivePartialInput } from '@/lib/fsm/schema';

export default function ReceivePartialDialog({ open, onClose, onSubmit, lines }:{
  open:boolean; onClose:()=>void; onSubmit:(payload:ReceivePartialInput)=>void;
  lines: { id:string; name:string; qty:number }[];
}) {
  const [vals, setVals] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [err, setErr] = useState<string|null>(null);

  useEffect(()=>{ if(open){ const init:Record<string,number>={}; lines.forEach(l=>init[l.id]=0); setVals(init); setComment(''); setErr(null); } },[open]);

  const submit = () => {
    const payload = {
      comment,
      lines: Object.entries(vals).filter(([,q])=>q>0).map(([id,q])=>({id, qtyAccepted:q}))
    };
    const parsed = receivePartialSchema.safeParse(payload);
    if (!parsed.success) { setErr('Заполните корректно количества'); return; }
    onSubmit(parsed.data);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center">
      <div className="w-[560px] max-w-[95vw] bg-white rounded-2xl p-4 space-y-3">
        <div className="text-lg font-semibold">Частичный приём</div>
        <div className="max-h-[50vh] overflow-auto space-y-2">
          {lines.map(l=>(
            <div key={l.id} className="flex items-center gap-2">
              <div className="flex-1">
                <div className="text-sm font-medium">{l.name}</div>
                <div className="text-xs text-gray-500">В ожидании: {l.qty}</div>
              </div>
              <input className="h-10 w-24 border rounded-xl px-2" inputMode="numeric"
                     value={vals[l.id] ?? 0}
                     onChange={(e)=>setVals(v=>({...v,[l.id]: Number(e.target.value||0)}))}/>
            </div>
          ))}
        </div>
        <textarea className="w-full border rounded-xl px-3 py-2" rows={3} placeholder="Комментарий (опц.)"
                  value={comment} onChange={(e)=>setComment(e.target.value)} />
        {err && <div className="text-sm text-red-600">{err}</div>}
        <div className="flex justify-end gap-2">
          <button className="h-10 px-4 rounded-xl border" onClick={onClose}>Отмена</button>
          <button className="h-10 px-4 rounded-xl bg-[var(--brand)] text-white" onClick={submit}>Подтвердить</button>
        </div>
      </div>
    </div>
  );
}


