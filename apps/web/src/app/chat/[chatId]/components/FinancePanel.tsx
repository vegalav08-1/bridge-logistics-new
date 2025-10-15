'use client';
import React, { useState } from 'react';
import { useFinance } from '@/lib/finance/useFinance';
import Money from '@/components/finance/Money';
import IfCan from '@/lib/acl/IfCan';
import PaymentDialog from '@/components/finance/PaymentDialog';

export default function FinancePanel({ 
  chatId, 
  baseCcy = 'RUB' 
}: { 
  chatId: string; 
  baseCcy?: string 
}) {
  const f = useFinance(chatId, baseCcy as any);
  const [openPay, setOpenPay] = useState(false);

  return (
    <div className="rounded-2xl border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">Финансы</div>
        {f.balance && (
          <div className="text-sm">
            Долг: <Money value={f.balance.debt} ccy={f.balance.currency} />
          </div>
        )}
      </div>

      {/* инвойсы */}
      <div className="space-y-2">
        {f.invoices.map(inv => (
          <div key={inv.id} className="rounded-xl border p-2 flex items-center justify-between">
            <div className="text-sm">
              Инвойс {inv.id.slice(-6)} · {inv.status}
              <div className="text-xs text-gray-500">
                от {new Date(inv.issuedAtISO).toLocaleDateString()}
              </div>
            </div>
            <div><Money value={inv.total} ccy={inv.currency} /></div>
          </div>
        ))}
      </div>

      {/* действия */}
      <div className="flex gap-2">
        <IfCan resource="finance" action="invoice">
          <button 
            className="h-10 px-3 rounded-xl border" 
            onClick={() => {/* open create invoice route */}}
          >
            Выставить счёт
          </button>
        </IfCan>
        <IfCan resource="finance" action="pay">
          <button 
            className="h-10 px-3 rounded-xl bg-[var(--brand)] text-white" 
            onClick={() => setOpenPay(true)}
          >
            Оплатить
          </button>
        </IfCan>
      </div>

      <PaymentDialog 
        open={openPay} 
        onClose={() => setOpenPay(false)}
        onSubmit={async (payload) => { 
          await f.postPayment(payload); 
          setOpenPay(false); 
        }} 
      />
      {f.err && <div className="text-sm text-red-600">{f.err}</div>}
    </div>
  );
}


