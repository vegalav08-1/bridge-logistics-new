'use client';
import { useState } from 'react';
import { useOrder } from '@/lib/order/hooks/useOrder';
import { useTransitions } from '@/lib/order/hooks/useTransitions';
import { ORDER_FSM_V1_ENABLED } from '@/lib/flags';

export default function OrderStatusActions({ orderId, actorRole }: { orderId: string; actorRole: any }) {
  const { order, setOrder } = useOrder(orderId);
  const { transition } = useTransitions(order!, actorRole);

  if (!ORDER_FSM_V1_ENABLED) return null;

  if (!order) return null;

  const exec = async (key: any) => {
    try {
      const next = await transition(key);
      setOrder(next);
    } catch (e: any) {
      alert(`Cannot transition: ${e.message}`);
    }
  };

  const handleAccept = async (type: 'full' | 'partial') => {
    try {
      // Записываем в журнал решение
      const message = `Принято ${type === 'full' ? 'полностью' : 'частично'}`;
      console.log('Journal entry:', message);
      
      // Переходим к следующему этапу
      await exec('RECEIVE_ACCEPT');
    } catch (e: any) {
      alert(`Ошибка: ${e.message}`);
    }
  };

  // Пример: набор кнопок для текущего статуса (минимально)
  const byStatus: Record<string, Array<{ label: string; key: any }>> = {
    NEW: [
      { label: 'Сканер', key: 'SCAN' },
      { label: 'Принять полностью', key: 'ACCEPT_FULL' },
      { label: 'Принять частично', key: 'ACCEPT_PARTIAL' }
    ],
    RECEIVE: [{ label: 'Начать сверку', key: 'RECONCILE_START' }],
    RECONCILE: [{ label: 'Завершить сверку', key: 'RECONCILE_FINISH' }],
    PACK: [{ label: 'Завершить упаковку', key: 'PACK_FINISH' }],
    MERGE: [{ label: 'Отгрузить', key: 'SHIP' }],
    IN_TRANSIT: [{ label: 'Курьер в пути', key: 'OUT_FOR_DELIVERY' }],
    ON_DELIVERY: [{ label: 'Выдать', key: 'DELIVER' }]
  };

  // Специальная логика для этапа NEW - кнопки теперь в шапке чата
  if (order.status === 'NEW') {
    return null; // Кнопки принятия теперь отображаются в ChatHeader
  }

  return (
    <div className="flex flex-wrap gap-2">
      {(byStatus[order.status] || []).map(btn => (
        <button key={btn.key} className="h-10 px-3 rounded-xl bg-[var(--brand)] text-white" onClick={() => exec(btn.key)}>{btn.label}</button>
      ))}
    </div>
  );
}
