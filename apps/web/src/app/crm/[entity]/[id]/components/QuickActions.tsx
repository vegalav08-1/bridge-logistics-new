'use client';
export default function QuickActions({ onNewShipment, onNewTask, onTag }: {
  onNewShipment: () => void; onNewTask: () => void; onTag: () => void;
}) {
  return (
    <div className="rounded-2xl border p-3 flex gap-2 flex-wrap">
      <button className="h-9 px-3 rounded-xl bg-[var(--brand)] text-white" onClick={onNewShipment}>+ Создать отгрузку</button>
      <button className="h-9 px-3 rounded-xl border" onClick={onNewTask}>+ Задача</button>
      <button className="h-9 px-3 rounded-xl border" onClick={onTag}>Метки</button>
    </div>
  );
}

