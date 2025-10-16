'use client';

import React, { useState, useEffect } from 'react';

interface ParcelFormData {
  code?: string;
  name?: string;
  kind: 'box' | 'pallet' | 'crating';
  pieces?: number;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  attrs?: string;
  createLabel?: boolean;
}

interface ParcelFormProps {
  chatId: string;
  parcel?: any; // Для редактирования
  onSave: (data: ParcelFormData) => void;
  onCancel: () => void;
  presets?: Array<{
    id: string;
    name: string;
    kind: string;
    dims: string;
    priceRules: string;
  }>;
}

export function ParcelForm({ chatId, parcel, onSave, onCancel, presets = [] }: ParcelFormProps) {
  const [formData, setFormData] = useState<ParcelFormData>({
    kind: 'box',
    createLabel: false,
    ...parcel
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save parcel');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (preset: any) => {
    try {
      const dims = JSON.parse(preset.dims);
      setFormData(prev => ({
        ...prev,
        kind: preset.kind,
        lengthCm: dims.l,
        widthCm: dims.w,
        heightCm: dims.h,
        attrs: preset.priceRules
      }));
    } catch (err) {
      console.error('Error parsing preset:', err);
    }
  };

  const calculateVolume = () => {
    const { lengthCm, widthCm, heightCm } = formData;
    if (lengthCm && widthCm && heightCm) {
      return (lengthCm * widthCm * heightCm) / 1000000; // см³ в м³
    }
    return null;
  };

  const volume = calculateVolume();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">
            {parcel ? 'Редактировать посылку' : 'Создать посылку'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Пресеты */}
          {presets.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пресет упаковки
              </label>
              <select
                onChange={(e) => {
                  const preset = presets.find(p => p.id === e.target.value);
                  if (preset) handlePresetSelect(preset);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите пресет...</option>
                {presets.map(preset => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Код посылки */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Код посылки
            </label>
            <input
              type="text"
              value={formData.code || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              placeholder="Автогенерация"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Название */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название (опционально)
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Box #1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Тип упаковки */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип упаковки
            </label>
            <select
              value={formData.kind}
              onChange={(e) => setFormData(prev => ({ ...prev, kind: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="box">Коробка</option>
              <option value="pallet">Палета</option>
              <option value="crating">Обрешетка</option>
            </select>
          </div>

          {/* Габариты */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Габариты (см)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                placeholder="Длина"
                value={formData.lengthCm || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, lengthCm: parseFloat(e.target.value) || undefined }))}
                min="0"
                max="300"
                step="0.1"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Ширина"
                value={formData.widthCm || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, widthCm: parseFloat(e.target.value) || undefined }))}
                min="0"
                max="300"
                step="0.1"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Высота"
                value={formData.heightCm || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, heightCm: parseFloat(e.target.value) || undefined }))}
                min="0"
                max="300"
                step="0.1"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {volume && (
              <p className="mt-1 text-sm text-gray-600">
                Объем: {volume.toFixed(4)} м³
              </p>
            )}
          </div>

          {/* Вес и количество */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Вес (кг)
              </label>
              <input
                type="number"
                value={formData.weightKg || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, weightKg: parseFloat(e.target.value) || undefined }))}
                min="0"
                max="2000"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Количество (шт)
              </label>
              <input
                type="number"
                value={formData.pieces || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, pieces: parseInt(e.target.value) || undefined }))}
                min="1"
                max="10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Тип упаковки (атрибуты) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип упаковки
            </label>
            <select
              value={formData.attrs || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, attrs: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Выберите тип...</option>
              <option value='{"type":"tape_bag"}'>Скотч+мешок</option>
              <option value='{"type":"wood_corners"}'>Деревянные уголки</option>
              <option value='{"type":"lattice"}'>Орешетка</option>
              <option value='{"type":"wood_box"}'>Деревянный ящик</option>
              <option value='{"type":"pallet"}'>Палет</option>
            </select>
          </div>

          {/* Создать этикетку */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="createLabel"
              checked={formData.createLabel}
              onChange={(e) => setFormData(prev => ({ ...prev, createLabel: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="createLabel" className="ml-2 text-sm text-gray-700">
              Создать этикетку после сохранения
            </label>
          </div>

          {/* Кнопки */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}




