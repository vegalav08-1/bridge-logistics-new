'use client';
import { useState } from 'react';
import { paymentSchema } from '@/lib/finance/schema';

export default function PaymentDialog({ 
  open, 
  onClose, 
  onSubmit 
}: {
  open: boolean; 
  onClose: () => void; 
  onSubmit: (p: any) => Promise<void>;
}) {
  const [method, setMethod] = useState<'CASH' | 'BANK' | 'CARD'>('BANK');
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState<'RUB' | 'USD' | 'EUR' | 'KZT' | 'CNY'>('RUB');
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    const parsed = paymentSchema.safeParse({ invoiceId: 'AUTO', method, amount, currency });
    if (!parsed.success) { setErr('Проверьте сумму/валюту'); return; }
    await onSubmit(parsed.data);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center">
      <div className="w-[520px] max-w-[95vw] bg-white rounded-2xl p-4 space-y-3">
        <div className="text-lg font-semibold">Оплата</div>
        <div className="grid grid-cols-3 gap-2">
          <button 
            className={`h-10 rounded-xl border ${method === 'CASH' ? 'bg-[var(--muted)]' : ''}`} 
            onClick={() => setMethod('CASH')}
          >
            Нал
          </button>
          <button 
            className={`h-10 rounded-xl border ${method === 'BANK' ? 'bg-[var(--muted)]' : ''}`} 
            onClick={() => setMethod('BANK')}
          >
            Безнал
          </button>
          <button 
            className={`h-10 rounded-xl border ${method === 'CARD' ? 'bg-[var(--muted)]' : ''}`} 
            onClick={() => setMethod('CARD')}
          >
            Карта
          </button>
        </div>
        <div className="flex gap-2">
          <input 
            className="h-10 rounded-xl border px-3 flex-1" 
            inputMode="decimal" 
            placeholder="Сумма" 
            onChange={(e) => setAmount(Number(e.target.value || 0))}
          />
          <select 
            className="h-10 rounded-xl border px-2" 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value as any)}
          >
            {['RUB', 'USD', 'EUR', 'KZT', 'CNY'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <div className="flex justify-end gap-2">
          <button className="h-10 px-3 rounded-xl border" onClick={onClose}>Отмена</button>
          <button className="h-10 px-3 rounded-xl bg-[var(--brand)] text-white" onClick={submit}>Оплатить</button>
        </div>
      </div>
    </div>
  );
}


