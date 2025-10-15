'use client';
export default function TasksWidget({ list, onToggle, onAdd }: { list: any[]; onToggle: (id: string, done: boolean) => void; onAdd: () => void }) {
  return (
    <div className="rounded-2xl border p-3">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">Задачи</div>
        <button className="h-8 px-2 rounded-lg border text-xs" onClick={onAdd}>+ Добавить</button>
      </div>
      <div className="mt-2 space-y-1">
        {list.map(t => (
          <label key={t.id} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!t.done} onChange={(e) => onToggle(t.id, e.target.checked)} />
            <span className={t.done ? 'line-through text-gray-400' : ''}>{t.title}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

