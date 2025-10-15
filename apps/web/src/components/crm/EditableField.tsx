'use client';
import { useState } from 'react';

export default function EditableField({ 
  value, 
  onSave, 
  label, 
  placeholder = "Введите значение" 
}: { 
  value: string; 
  onSave: (newValue: string) => void; 
  label: string;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onSave(tempValue);
    setEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="space-y-2">
        <label className="text-sm text-gray-600">{label}</label>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            placeholder={placeholder}
          />
          <button
            className="h-8 px-3 rounded-lg bg-[var(--brand)] text-white text-sm"
            onClick={handleSave}
          >
            Сохранить
          </button>
          <button
            className="h-8 px-3 rounded-lg border text-sm"
            onClick={handleCancel}
          >
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-600">{label}</div>
        <div className="text-sm font-medium">{value || '—'}</div>
      </div>
      <button
        className="h-8 px-3 rounded-lg border text-sm"
        onClick={() => setEditing(true)}
      >
        Изменить
      </button>
    </div>
  );
}

