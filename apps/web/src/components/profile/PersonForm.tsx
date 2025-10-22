'use client';

import React from 'react';
import { PersonProfile } from '@/lib/domain/profile';

interface PersonFormProps {
  data: PersonProfile;
  onChange: (data: PersonProfile) => void;
  disabled?: boolean;
}

export function PersonForm({ data, onChange, disabled }: PersonFormProps) {
  const handleChange = (field: keyof PersonProfile, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Имя *
          </label>
          <input
            type="text"
            value={data.first_name || ''}
            onChange={(e) => handleChange('first_name', e.target.value)}
            disabled={disabled}
            className="w-full h-11 rounded-xl border px-3"
            placeholder="Введите имя"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Фамилия *
          </label>
          <input
            type="text"
            value={data.last_name || ''}
            onChange={(e) => handleChange('last_name', e.target.value)}
            disabled={disabled}
            className="w-full h-11 rounded-xl border px-3"
            placeholder="Введите фамилию"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Дата рождения
        </label>
        <input
          type="date"
          value={data.date_of_birth || ''}
          onChange={(e) => handleChange('date_of_birth', e.target.value)}
          disabled={disabled}
          className="w-full h-11 rounded-xl border px-3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Номер паспорта
        </label>
        <input
          type="text"
          value={data.passport_no || ''}
          onChange={(e) => handleChange('passport_no', e.target.value)}
          disabled={disabled}
          className="w-full h-11 rounded-xl border px-3"
          placeholder="1234 567890"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Национальный ID
        </label>
        <input
          type="text"
          value={data.national_id || ''}
          onChange={(e) => handleChange('national_id', e.target.value)}
          disabled={disabled}
          className="w-full h-11 rounded-xl border px-3"
          placeholder="SNILS, ИНН и т.д."
        />
      </div>
    </div>
  );
}
