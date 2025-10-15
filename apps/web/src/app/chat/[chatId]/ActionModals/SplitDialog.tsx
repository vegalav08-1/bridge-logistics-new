'use client';
import { useState } from 'react';
import { splitSchema, type SplitInput } from '@/lib/fsm/schema';

export default function SplitDialog({ open, onClose, onSubmit, lines }:{
  open:boolean; onClose:()=>void; onSubmit:(payload:SplitInput)=>void;
  lines: { id:string; name:string; qty:number }[];
}) {
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [title, setTitle] = useState('');
  const submit = () => {
    const payload: SplitInput = { newTitle: title || undefined,
      picks: Object.entries(picks).filter(([,q])=>q>0).map(([id,qty])=>({id,qty})) };
    const parsed = splitSchema.safeParse(payload);
    if (!parsed.success) return;
    onSubmit(parsed.data);
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center">
      <div className="w-[560px] max-w-[95vw] bg-white rounded-2xl p-4 space-y-3">
        <div className="text-lg font-semibold">Отделить часть (Split)</div>
        <input className="h-11 w-full border rounded-xl px-3" placeholder="Название новой отгрузки (опц.)"
               value={title} onChange={(e)=>setTitle(e.target.value)} />
        <div className="max-h-[50vh] overflow-auto space-y-2">
          {lines.map(l=>(
            <div key={l.id} className="flex items-center gap-2">
              <div className="flex-1">
                <div className="text-sm font-medium">{l.name}</div>
                <div className="text-xs text-gray-500">Доступно: {l.qty}</div>
              </div>
              <input className="h-10 w-24 border rounded-xl px-2" inputMode="numeric"
                     value={picks[l.id] ?? 0}
                     onChange={(e)=>setPicks(v=>({...v,[l.id]: Number(e.target.value||0)}))}/>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button className="h-10 px-4 rounded-xl border" onClick={onClose}>Отмена</button>
          <button className="h-10 px-4 rounded-xl bg-[var(--brand)] text-white" onClick={submit}>Создать</button>
        </div>
      </div>
    </div>
  );
}


