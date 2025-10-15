'use client';
import React from 'react';
import MentionAutocomplete from './MentionAutocomplete';
import { extractMentions } from '@/lib/chat2/mentions';

export default function MessageInputV2({
  onSend, mentionIndex
}:{
  onSend: (payload:{ text:string; mentions: Array<{id:string; name:string}> })=>void;
  mentionIndex: Array<{ id:string; name:string }>;
}){
  const [val,setVal]=React.useState('');
  const [atPos,setAtPos]=React.useState<number|null>(null);
  const [query,setQuery]=React.useState('');

  const onChange=(e:React.ChangeEvent<HTMLTextAreaElement>)=>{
    const t = e.target.value;
    setVal(t);
    const sel = e.target.selectionStart ?? t.length;
    const upto = t.slice(0, sel);
    const at = upto.lastIndexOf('@');
    // если есть '@' и перед ним пробел/начало — открываем автокомплит
    if (at>=0 && (at===0 || /\s/.test(upto[at-1]))) {
      setAtPos(at);
      setQuery(t.slice(at+1, sel));
    } else { setAtPos(null); setQuery(''); }
  };

  const pick=(item:{id:string; name:string})=>{
    if (atPos===null) return;
    const before = val.slice(0, atPos);
    const after = val.slice((atPos + 1 + query.length));
    const next = `${before}@${item.name}${after}`;
    setVal(next); setAtPos(null); setQuery('');
  };

  const send=()=>{
    if(!val.trim()) return;
    const idx = mentionIndex;
    const mentionsRaw = extractMentions(val, idx);
    // нормализуем в {id,name}
    const mentions = Array.from(new Set(mentionsRaw.map(m=> m.userId))).map(id=>{
      const f = idx.find(x=>x.id===id)!; return { id, name: f.name };
    });
    onSend({ text: val, mentions });
    setVal('');
  };

  return (
    <div className="relative">
      <textarea
        className="w-full rounded-2xl border px-3 py-2 min-h-[44px] resize-y"
        value={val} onChange={onChange} placeholder="Напишите сообщение… (@упомянуть)"
      />
      {!!query && <div className="absolute left-2 bottom-[calc(100%+4px)]"><MentionAutocomplete query={query} items={mentionIndex} onPick={pick}/></div>}
      <div className="flex justify-end mt-2">
        <button className="h-9 px-3 rounded-xl bg-[var(--brand)] text-white" onClick={send}>Отправить</button>
      </div>
    </div>
  );
}

