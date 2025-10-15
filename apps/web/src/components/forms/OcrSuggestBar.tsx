'use client';
import { useState } from 'react';
import { runOCR } from '@/lib/scanner/ocr';
import type { OcrResult } from '@/lib/search/types';

export default function OcrSuggestBar({ onApply }:{ onApply:(f:OcrResult['fields'])=>void }) {
  const [busy,setBusy]=useState(false);
  const [progress,setProgress]=useState(0);
  const [res,setRes]=useState<OcrResult|null>(null);

  const pickFile = async () => {
    const input = document.createElement('input'); input.type='file'; input.accept='image/*';
    input.onchange = async () => {
      const f = input.files?.[0]; if (!f) return;
      setBusy(true); const r = await runOCR(f, (p)=>setProgress(p)); setRes(r); setBusy(false);
    };
    input.click();
  };

  return (
    <div className="rounded-xl border p-2 flex items-center gap-2">
      <button className="h-9 px-3 rounded-lg border" onClick={pickFile} disabled={busy}>OCR из фото</button>
      {busy && <div className="text-xs text-gray-500">Распознаём… {(progress*100|0)}%</div>}
      {res?.fields && (
        <div className="flex-1 text-xs text-gray-600">
          Предлагаем заполнить: {Object.entries(res.fields).map(([k,v])=>`${k}=${v}`).join(', ')}
          <button className="ml-2 text-[var(--brand)] underline" onClick={()=>onApply(res.fields)}>Применить</button>
        </div>
      )}
    </div>
  );
}


