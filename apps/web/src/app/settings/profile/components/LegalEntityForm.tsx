'use client';
import React, { useState } from 'react';
import { legalEntityProfileSchema } from '@/lib/settings/schema';
import { FieldHint } from '@/components/ui/FieldHint';

interface LegalEntityFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
  userEmail: string; // Email из регистрации
}

export function LegalEntityForm({ initialData, onSave, onCancel, loading = false, userEmail }: LegalEntityFormProps) {
  const [form, setForm] = useState({
    email: userEmail,
    phone: initialData?.phone || '',
    clientCode: initialData?.clientCode || '',
    companyName: initialData?.companyName || '',
    legalForm: initialData?.legalForm || '',
    inn: initialData?.inn || '',
    kpp: initialData?.kpp || '',
    ogrn: initialData?.ogrn || '',
    legalAddress: initialData?.legalAddress || '',
    actualAddress: initialData?.actualAddress || '',
    city: initialData?.city || '',
    postalCode: initialData?.postalCode || '',
    country: initialData?.country || '',
    directorName: initialData?.directorName || '',
    directorPosition: initialData?.directorPosition || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = legalEntityProfileSchema.safeParse(form);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          newErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await onSave(result.data);
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-lg font-semibold text-gray-900 mb-6">
        Данные юридического лица
      </div>

      {/* Email (нередактируемый) */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Электронная почта
        </label>
        <input
          type="email"
          value={form.email}
          disabled
          className="w-full h-11 rounded-xl border border-gray-300 px-3 bg-gray-50 text-gray-500 cursor-not-allowed"
          placeholder="Email из регистрации"
        />
        <FieldHint hint="Email берется из данных регистрации и не может быть изменен" />
      </div>

      {/* Мобильный телефон */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Мобильный телефон *
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          className={`w-full h-11 rounded-xl border px-3 ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="+7 (999) 123-45-67"
        />
        {errors?.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        <FieldHint hint="Введите номер телефона в международном формате" />
      </div>

      {/* Код клиента */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Номер клиента *
        </label>
        <input
          type="text"
          value={form.clientCode}
          onChange={(e) => updateField('clientCode', e.target.value)}
          className={`w-full h-11 rounded-xl border px-3 ${
            errors.clientCode ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Уникальный код клиента"
        />
        {errors?.clientCode && <p className="text-red-500 text-xs mt-1">{errors.clientCode}</p>}
        <FieldHint hint="Уникальный код клиента используется для идентификации в системе" />
      </div>

      {/* Название компании */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Название компании *
        </label>
        <input
          type="text"
          value={form.companyName}
          onChange={(e) => updateField('companyName', e.target.value)}
          className={`w-full h-11 rounded-xl border px-3 ${
            errors.companyName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="ООО «Название компании»"
        />
        {errors?.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
      </div>

      {/* Правовая форма */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Правовая форма *
        </label>
        <select
          value={form.legalForm}
          onChange={(e) => updateField('legalForm', e.target.value)}
          className={`w-full h-11 rounded-xl border px-3 ${
            errors.legalForm ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Выберите правовую форму</option>
          <option value="ООО">ООО (Общество с ограниченной ответственностью)</option>
          <option value="АО">АО (Акционерное общество)</option>
          <option value="ИП">ИП (Индивидуальный предприниматель)</option>
          <option value="ЗАО">ЗАО (Закрытое акционерное общество)</option>
          <option value="ОАО">ОАО (Открытое акционерное общество)</option>
        </select>
        {errors?.legalForm && <p className="text-red-500 text-xs mt-1">{errors.legalForm}</p>}
      </div>

      {/* Реквизиты */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ИНН *
          </label>
          <input
            type="text"
            value={form.inn}
            onChange={(e) => updateField('inn', e.target.value)}
            className={`w-full h-11 rounded-xl border px-3 ${
              errors.inn ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="1234567890"
          />
          {errors?.inn && <p className="text-red-500 text-xs mt-1">{errors.inn}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            КПП
          </label>
          <input
            type="text"
            value={form.kpp}
            onChange={(e) => updateField('kpp', e.target.value)}
            className="w-full h-11 rounded-xl border border-gray-300 px-3"
            placeholder="123456789"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ОГРН *
          </label>
          <input
            type="text"
            value={form.ogrn}
            onChange={(e) => updateField('ogrn', e.target.value)}
            className={`w-full h-11 rounded-xl border px-3 ${
              errors.ogrn ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="1234567890123"
          />
          {errors?.ogrn && <p className="text-red-500 text-xs mt-1">{errors.ogrn}</p>}
        </div>
      </div>

      {/* Адреса */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Юридический адрес *
        </label>
        <input
          type="text"
          value={form.legalAddress}
          onChange={(e) => updateField('legalAddress', e.target.value)}
          className={`w-full h-11 rounded-xl border px-3 ${
            errors.legalAddress ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="123456, г. Москва, ул. Примерная, д. 1"
        />
        {errors?.legalAddress && <p className="text-red-500 text-xs mt-1">{errors.legalAddress}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Фактический адрес *
        </label>
        <input
          type="text"
          value={form.actualAddress}
          onChange={(e) => updateField('actualAddress', e.target.value)}
          className={`w-full h-11 rounded-xl border px-3 ${
            errors.actualAddress ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="123456, г. Москва, ул. Примерная, д. 1"
        />
        {errors?.actualAddress && <p className="text-red-500 text-xs mt-1">{errors.actualAddress}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Город *
          </label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => updateField('city', e.target.value)}
            className={`w-full h-11 rounded-xl border px-3 ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Москва"
          />
          {errors?.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Почтовый индекс *
          </label>
          <input
            type="text"
            value={form.postalCode}
            onChange={(e) => updateField('postalCode', e.target.value)}
            className={`w-full h-11 rounded-xl border px-3 ${
              errors.postalCode ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="123456"
          />
          {errors?.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Страна *
          </label>
          <input
            type="text"
            value={form.country}
            onChange={(e) => updateField('country', e.target.value)}
            className={`w-full h-11 rounded-xl border px-3 ${
              errors.country ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Россия"
          />
          {errors?.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
        </div>
      </div>

      {/* Контактное лицо */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ФИО контактного лица *
          </label>
          <input
            type="text"
            value={form.directorName}
            onChange={(e) => updateField('directorName', e.target.value)}
            className={`w-full h-11 rounded-xl border px-3 ${
              errors.directorName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Иванов Иван Иванович"
          />
          {errors?.directorName && <p className="text-red-500 text-xs mt-1">{errors.directorName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Должность контактного лица *
          </label>
          <input
            type="text"
            value={form.directorPosition}
            onChange={(e) => updateField('directorPosition', e.target.value)}
            className={`w-full h-11 rounded-xl border px-3 ${
              errors.directorPosition ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Должность контактного лица"
          />
          {errors?.directorPosition && <p className="text-red-500 text-xs mt-1">{errors.directorPosition}</p>}
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex gap-3 justify-end pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={loading}
          className="h-11 px-6 rounded-xl bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </form>
  );
}
