'use client';

import React from 'react';
import { CompanyProfile } from '@/lib/domain/profile';

interface CompanyFormProps {
  data: CompanyProfile;
  onChange: (data: CompanyProfile) => void;
  disabled?: boolean;
}

export function CompanyForm({ data, onChange, disabled }: CompanyFormProps) {
  const handleChange = (field: keyof CompanyProfile, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Название компании *
        </label>
        <input
          type="text"
          value={data.company_name || ''}
          onChange={(e) => handleChange('company_name', e.target.value)}
          disabled={disabled}
          className="w-full h-11 rounded-xl border px-3"
          placeholder="ООО «Название компании»"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Регистрационный номер
          </label>
          <input
            type="text"
            value={data.reg_no || ''}
            onChange={(e) => handleChange('reg_no', e.target.value)}
            disabled={disabled}
            className="w-full h-11 rounded-xl border px-3"
            placeholder="ОГРН"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            ИНН/VAT
          </label>
          <input
            type="text"
            value={data.tax_id || ''}
            onChange={(e) => handleChange('tax_id', e.target.value)}
            disabled={disabled}
            className="w-full h-11 rounded-xl border px-3"
            placeholder="ИНН или VAT номер"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          EORI номер
        </label>
        <input
          type="text"
          value={data.eori || ''}
          onChange={(e) => handleChange('eori', e.target.value)}
          disabled={disabled}
          className="w-full h-11 rounded-xl border px-3"
          placeholder="EU123456789"
        />
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-3">Банковские реквизиты</h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Название банка
            </label>
            <input
              type="text"
              value={data.bank_name || ''}
              onChange={(e) => handleChange('bank_name', e.target.value)}
              disabled={disabled}
              className="w-full h-11 rounded-xl border px-3"
              placeholder="Сбербанк"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              IBAN
            </label>
            <input
              type="text"
              value={data.iban || ''}
              onChange={(e) => handleChange('iban', e.target.value)}
              disabled={disabled}
              className="w-full h-11 rounded-xl border px-3"
              placeholder="DE89370400440532013000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              SWIFT
            </label>
            <input
              type="text"
              value={data.swift || ''}
              onChange={(e) => handleChange('swift', e.target.value)}
              disabled={disabled}
              className="w-full h-11 rounded-xl border px-3"
              placeholder="DEUTDEFF"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Контактное лицо
        </label>
        <input
          type="text"
          value={data.contact_person || ''}
          onChange={(e) => handleChange('contact_person', e.target.value)}
          disabled={disabled}
          className="w-full h-11 rounded-xl border px-3"
          placeholder="Иван Иванов"
        />
      </div>
    </div>
  );
}
