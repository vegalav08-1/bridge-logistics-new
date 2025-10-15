'use client';

import React, { useState, useEffect } from 'react';

interface Preset {
  id: string;
  name: string;
  kind: 'box' | 'pallet' | 'crating';
  dims: string; // JSON строка
  priceRules: string; // JSON строка
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PackingPresetsProps {
  onClose: () => void;
}

export function PackingPresets({ onClose }: PackingPresetsProps) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);

  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/packing/presets');
      if (!response.ok) {
        throw new Error('Failed to fetch presets');
      }
      const data = await response.json();
      setPresets(data.presets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePreset = async (presetData: any) => {
    try {
      const response = await fetch('/api/packing/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(presetData)
      });

      if (!response.ok) {
        throw new Error('Failed to create preset');
      }

      await fetchPresets();
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create preset');
    }
  };

  const handleUpdatePreset = async (presetId: string, data: any) => {
    try {
      const response = await fetch(`/api/packing/presets/${presetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update preset');
      }

      await fetchPresets();
      setEditingPreset(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preset');
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    if (!confirm('Удалить этот пресет?')) return;

    try {
      const response = await fetch(`/api/packing/presets/${presetId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete preset');
      }

      await fetchPresets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete preset');
    }
  };

  const parseDims = (dimsJson: string) => {
    try {
      const dims = JSON.parse(dimsJson);
      return `${dims.l}×${dims.w}×${dims.h} см`;
    } catch {
      return '—';
    }
  };

  const parsePriceRules = (priceRulesJson: string) => {
    try {
      const rules = JSON.parse(priceRulesJson);
      const parts = [];
      
      if (rules.packing?.fixed) {
        parts.push(`Фикс: $${rules.packing.fixed}`);
      }
      if (rules.packing?.perKg) {
        parts.push(`$${rules.packing.perKg}/кг`);
      }
      if (rules.insurance?.percent) {
        parts.push(`Страховка: ${rules.insurance.percent}%`);
      }
      
      return parts.join(', ') || '—';
    } catch {
      return '—';
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Загрузка пресетов...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold">Пресеты упаковки</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Создать пресет
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Список пресетов */}
      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {presets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Пресеты не найдены</p>
            <p className="text-sm">Создайте первый пресет</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map(preset => (
              <div key={preset.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{preset.name}</h3>
                    {preset.isDefault && (
                      <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        По умолчанию
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setEditingPreset(preset)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeletePreset(preset.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="Удалить"
                    >
                      🗑
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Тип:</span> {
                      preset.kind === 'box' ? 'Коробка' :
                      preset.kind === 'pallet' ? 'Палета' : 'Обрешетка'
                    }
                  </div>
                  <div>
                    <span className="font-medium">Размеры:</span> {parseDims(preset.dims)}
                  </div>
                  <div>
                    <span className="font-medium">Правила:</span> {parsePriceRules(preset.priceRules)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Форма создания/редактирования */}
      {(showCreateForm || editingPreset) && (
        <PresetForm
          preset={editingPreset || undefined}
          onSave={editingPreset ? 
            (data) => handleUpdatePreset(editingPreset.id, data) :
            handleCreatePreset
          }
          onCancel={() => {
            setShowCreateForm(false);
            setEditingPreset(null);
          }}
        />
      )}
    </div>
  );
}

// Форма для создания/редактирования пресета
interface PresetFormProps {
  preset?: Preset;
  onSave: (data: any) => void;
  onCancel: () => void;
}

function PresetForm({ preset, onSave, onCancel }: PresetFormProps) {
  const [formData, setFormData] = useState({
    name: preset?.name || '',
    kind: preset?.kind || 'box',
    length: preset ? JSON.parse(preset.dims).l : 0,
    width: preset ? JSON.parse(preset.dims).w : 0,
    height: preset ? JSON.parse(preset.dims).h : 0,
    packingFixed: preset ? JSON.parse(preset.priceRules).packing?.fixed || 0 : 0,
    packingPerKg: preset ? JSON.parse(preset.priceRules).packing?.perKg || 0 : 0,
    insurancePercent: preset ? JSON.parse(preset.priceRules).insurance?.percent || 0 : 0,
    isDefault: preset?.isDefault || false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dims = JSON.stringify({
        l: formData.length,
        w: formData.width,
        h: formData.height
      });

      const priceRules = JSON.stringify({
        packing: {
          ...(formData.packingFixed > 0 && { fixed: formData.packingFixed }),
          ...(formData.packingPerKg > 0 && { perKg: formData.packingPerKg })
        },
        ...(formData.insurancePercent > 0 && {
          insurance: { percent: formData.insurancePercent }
        })
      });

      await onSave({
        name: formData.name,
        kind: formData.kind,
        dims,
        priceRules,
        isDefault: formData.isDefault
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">
            {preset ? 'Редактировать пресет' : 'Создать пресет'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Название */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Тип */}
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

          {/* Размеры */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Размеры по умолчанию (см)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                placeholder="Длина"
                value={formData.length}
                onChange={(e) => setFormData(prev => ({ ...prev, length: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.1"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Ширина"
                value={formData.width}
                onChange={(e) => setFormData(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.1"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Высота"
                value={formData.height}
                onChange={(e) => setFormData(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.1"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Правила ценообразования */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Стоимость упаковки
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Фикс ($)"
                value={formData.packingFixed}
                onChange={(e) => setFormData(prev => ({ ...prev, packingFixed: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.01"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="$ за кг"
                value={formData.packingPerKg}
                onChange={(e) => setFormData(prev => ({ ...prev, packingPerKg: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.01"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Страховка */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Страховка (% от стоимости товара)
            </label>
            <input
              type="number"
              value={formData.insurancePercent}
              onChange={(e) => setFormData(prev => ({ ...prev, insurancePercent: parseFloat(e.target.value) || 0 }))}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* По умолчанию */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
              Пресет по умолчанию
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
