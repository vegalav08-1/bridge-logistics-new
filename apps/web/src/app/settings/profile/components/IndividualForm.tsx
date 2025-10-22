'use client';
import React, { useState } from 'react';
import { individualProfileSchema } from '@/lib/settings/schema';
import { FieldHint } from '@/components/ui/FieldHint';

interface IndividualFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
  userEmail: string; // Email из регистрации
}

export function IndividualForm({ initialData, onSave, onCancel, loading = false, userEmail }: IndividualFormProps) {
  const [form, setForm] = useState({
    email: userEmail,
    phone: initialData?.phone || '',
    clientCode: initialData?.clientCode || '',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    middleName: initialData?.middleName || '',
    birthDate: initialData?.birthDate || '',
    passportNumber: initialData?.passportNumber || '',
    passportIssuedBy: initialData?.passportIssuedBy || '',
    passportIssueDate: initialData?.passportIssueDate || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    postalCode: initialData?.postalCode || '',
    country: initialData?.country || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = individualProfileSchema.safeParse(form);
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
        Данные физического лица
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

      {/* Личные данные */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Имя *
          </label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            className={`w-full h-11 rounded-xl border px-3 ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Имя"
          />
          {errors?.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Фамилия *
          </label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            className={`w-full h-11 rounded-xl border px-3 ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Фамилия"
          />
          {errors?.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Отчество
        </label>
        <input
          type="text"
          value={form.middleName}
          onChange={(e) => updateField('middleName', e.target.value)}
          className="w-full h-11 rounded-xl border border-gray-300 px-3"
          placeholder="Отчество"
        />
      </div>

      {/* Адрес */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Адрес *
        </label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => updateField('address', e.target.value)}
          className={`w-full h-11 rounded-xl border px-3 ${
            errors.address ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="ул. Примерная, д. 1, кв. 1"
        />
        {errors?.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
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

      {/* Паспортные данные - перенесены в конец */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Паспортные данные
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Номер паспорта
            </label>
            <input
              type="text"
              value={form.passportNumber}
              onChange={(e) => updateField('passportNumber', e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-300 px-3"
              placeholder="1234 567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Кем выдан
            </label>
            <input
              type="text"
              value={form.passportIssuedBy}
              onChange={(e) => updateField('passportIssuedBy', e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-300 px-3"
              placeholder="ОТДЕЛЕНИЕМ УФМС"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата выдачи
            </label>
            <input
              type="date"
              value={form.passportIssueDate}
              onChange={(e) => updateField('passportIssueDate', e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-300 px-3"
            />
          </div>
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
