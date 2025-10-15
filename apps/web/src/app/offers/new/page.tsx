'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { offerSchema } from '@/lib/finance/schema';
import { calcOfferTotal } from '@/lib/finance/calc';
import Money from '@/components/finance/Money';
import PriceInput from '@/components/finance/PriceInput';

export default function NewOfferPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    chatId: 'test-chat-123',
    currency: 'RUB' as const,
    lines: [{ id: '1', name: '', qty: 1, unit: 'pcs' as const, price: 0 }],
    discountPct: 0,
    taxPct: 0,
    note: ''
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const addLine = () => {
    setForm(f => ({
      ...f,
      lines: [...f.lines, { id: Date.now().toString(), name: '', qty: 1, unit: 'pcs', price: 0 }]
    }));
  };

  const updateLine = (id: string, field: string, value: any) => {
    setForm(f => ({
      ...f,
      lines: f.lines.map(l => l.id === id ? { ...l, [field]: value } : l)
    }));
  };

  const removeLine = (id: string) => {
    setForm(f => ({
      ...f,
      lines: f.lines.filter(l => l.id !== id)
    }));
  };

  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      const parsed = offerSchema.safeParse(form);
      if (!parsed.success) {
        setErr('Проверьте заполнение полей');
        return;
      }
      // TODO: API call
      router.push(`/chat/${form.chatId}`);
    } catch (e: any) {
      setErr(e?.message ?? 'Ошибка создания оффера');
    } finally {
      setBusy(false);
    }
  };

  const total = calcOfferTotal(form);

  return (
    <div className="px-4 py-3">
      <h1 className="text-lg font-semibold mb-4">Новый оффер</h1>
      
      <div className="space-y-4">
        {/* Валюта */}
        <div>
          <label className="text-sm font-medium">Валюта</label>
          <select 
            className="h-10 w-full rounded-xl border px-3 mt-1"
            value={form.currency}
            onChange={(e) => setForm(f => ({ ...f, currency: e.target.value as any }))}
          >
            <option value="RUB">RUB</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="KZT">KZT</option>
            <option value="CNY">CNY</option>
          </select>
        </div>

        {/* Позиции */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Позиции</label>
            <button 
              className="h-8 px-3 rounded-lg border text-sm" 
              onClick={addLine}
            >
              + Добавить
            </button>
          </div>
          <div className="space-y-2">
            {form.lines.map(line => (
              <div key={line.id} className="rounded-xl border p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    className="h-10 rounded-xl border px-3" 
                    placeholder="Название"
                    value={line.name}
                    onChange={(e) => updateLine(line.id, 'name', e.target.value)}
                  />
                  <select 
                    className="h-10 rounded-xl border px-3"
                    value={line.unit}
                    onChange={(e) => updateLine(line.id, 'unit', e.target.value)}
                  >
                    <option value="pcs">шт</option>
                    <option value="kg">кг</option>
                    <option value="m3">м³</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input 
                    className="h-10 rounded-xl border px-3" 
                    type="number"
                    placeholder="Количество"
                    value={line.qty}
                    onChange={(e) => updateLine(line.id, 'qty', Number(e.target.value))}
                  />
                  <PriceInput 
                    value={line.price}
                    onChange={(v) => updateLine(line.id, 'price', v)}
                    suffix={form.currency}
                  />
                  <button 
                    className="h-10 px-3 rounded-xl border text-red-600" 
                    onClick={() => removeLine(line.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Скидка и налог */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm font-medium">Скидка %</label>
            <input 
              className="h-10 w-full rounded-xl border px-3 mt-1" 
              type="number"
              value={form.discountPct}
              onChange={(e) => setForm(f => ({ ...f, discountPct: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Налог %</label>
            <input 
              className="h-10 w-full rounded-xl border px-3 mt-1" 
              type="number"
              value={form.taxPct}
              onChange={(e) => setForm(f => ({ ...f, taxPct: Number(e.target.value) }))}
            />
          </div>
        </div>

        {/* Примечание */}
        <div>
          <label className="text-sm font-medium">Примечание</label>
          <textarea 
            className="w-full rounded-xl border px-3 py-2 mt-1" 
            rows={3}
            value={form.note}
            onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))}
          />
        </div>

        {/* Итого */}
        <div className="rounded-xl border p-3 bg-[var(--muted)]">
          <div className="flex justify-between items-center">
            <span className="font-medium">Итого:</span>
            <Money value={total} ccy={form.currency} />
          </div>
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <div className="flex justify-end gap-2">
          <button 
            className="h-10 px-4 rounded-xl border" 
            onClick={() => router.back()}
          >
            Отмена
          </button>
          <button 
            className="h-10 px-4 rounded-xl bg-[var(--brand)] text-white" 
            onClick={submit}
            disabled={busy}
          >
            {busy ? 'Создание...' : 'Создать оффер'}
          </button>
        </div>
      </div>
    </div>
  );
}


