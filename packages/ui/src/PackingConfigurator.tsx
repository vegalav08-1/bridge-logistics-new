'use client';

import React, { useState, useEffect } from 'react';
import { FLAGS } from '@yp/shared';

interface Parcel {
  id: string;
  code: string;
  name?: string;
  kind: 'box' | 'pallet' | 'crating';
  pieces?: number;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  volumeM3?: number;
  attrs?: string;
  labelKey?: string;
  parent?: {
    id: string;
    code: string;
    name?: string;
  };
  children: Array<{
    id: string;
    code: string;
    name?: string;
    kind: string;
  }>;
  creator: {
    id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PackingConfiguratorProps {
  chatId: string;
  chatStatus: string;
  onClose: () => void;
}

export function PackingConfigurator({ chatId, chatStatus, onClose }: PackingConfiguratorProps) {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParcels, setSelectedParcels] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Проверяем доступность функции
  if (!FLAGS.PACK_PRO_ENABLED) {
    return null;
  }

  // Проверяем статус чата
  const canPack = ['PACK', 'MERGE'].includes(chatStatus);
  if (!canPack) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Конфигуратор упаковки доступен только в статусах PACK и MERGE</p>
        <button
          onClick={onClose}
          className="mt-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Закрыть
        </button>
      </div>
    );
  }

  useEffect(() => {
    fetchParcels();
  }, [chatId]);

  const fetchParcels = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chats/${chatId}/parcels`);
      if (!response.ok) {
        throw new Error('Failed to fetch parcels');
      }
      const data = await response.json();
      setParcels(data.parcels || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateParcel = async (parcelData: any) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/parcels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parcelData)
      });

      if (!response.ok) {
        throw new Error('Failed to create parcel');
      }

      await fetchParcels();
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create parcel');
    }
  };

  const handleUpdateParcel = async (parcelId: string, data: any) => {
    try {
      const response = await fetch(`/api/parcels/${parcelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update parcel');
      }

      await fetchParcels();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update parcel');
    }
  };

  const handleDeleteParcel = async (parcelId: string) => {
    if (!confirm('Удалить эту посылку?')) return;

    try {
      const response = await fetch(`/api/parcels/${parcelId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete parcel');
      }

      await fetchParcels();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete parcel');
    }
  };

  const handleMoveParcel = async (parcelId: string, parentId?: string) => {
    try {
      const response = await fetch(`/api/parcels/${parcelId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId })
      });

      if (!response.ok) {
        throw new Error('Failed to move parcel');
      }

      await fetchParcels();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move parcel');
    }
  };

  const handleGenerateLabels = async () => {
    if (selectedParcels.length === 0) {
      alert('Выберите посылки для печати этикеток');
      return;
    }

    try {
      const response = await fetch('/api/packing/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parcelIds: selectedParcels })
      });

      if (!response.ok) {
        throw new Error('Failed to generate labels');
      }

      const data = await response.json();
      alert(`Сгенерировано ${data.count} этикеток`);
      setSelectedParcels([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate labels');
    }
  };

  const formatDimensions = (length?: number, width?: number, height?: number) => {
    if (!length || !width || !height) return '—';
    return `${length}×${width}×${height} см`;
  };

  const formatVolume = (volume?: number) => {
    if (!volume) return '—';
    return `${volume.toFixed(4)} м³`;
  };

  const renderParcelCard = (parcel: Parcel, level = 0) => {
    const isSelected = selectedParcels.includes(parcel.id);
    const hasChildren = parcel.children.length > 0;

    return (
      <div key={parcel.id} className={`ml-${level * 4} mb-2`}>
        <div className={`border rounded-lg p-3 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedParcels([...selectedParcels, parcel.id]);
                  } else {
                    setSelectedParcels(selectedParcels.filter(id => id !== parcel.id));
                  }
                }}
                className="rounded"
              />
              <span className="font-mono text-sm font-bold">{parcel.code}</span>
              {parcel.name && <span className="text-gray-600">({parcel.name})</span>}
              <span className={`px-2 py-1 text-xs rounded ${
                parcel.kind === 'box' ? 'bg-blue-100 text-blue-800' :
                parcel.kind === 'pallet' ? 'bg-green-100 text-green-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {parcel.kind === 'box' ? 'Коробка' :
                 parcel.kind === 'pallet' ? 'Палета' : 'Обрешетка'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {formatDimensions(parcel.lengthCm, parcel.widthCm, parcel.heightCm)}
              </span>
              {parcel.weightKg && (
                <span className="text-sm text-gray-600">{parcel.weightKg} кг</span>
              )}
              {parcel.volumeM3 && (
                <span className="text-sm text-gray-600">{formatVolume(parcel.volumeM3)}</span>
              )}
              
              <div className="flex space-x-1">
                <button
                  onClick={() => {/* TODO: открыть форму редактирования */}}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button
                  onClick={() => {/* TODO: открыть форму перемещения */}}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title="Переместить"
                >
                  ⛓
                </button>
                <button
                  onClick={() => handleDeleteParcel(parcel.id)}
                  className="p-1 text-red-500 hover:text-red-700"
                  title="Удалить"
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
          
          {parcel.pieces && (
            <div className="mt-1 text-sm text-gray-600">
              Количество: {parcel.pieces} шт
            </div>
          )}
        </div>
        
        {/* Рекурсивно рендерим дочерние элементы */}
        {hasChildren && (
          <div className="mt-2">
            {parcel.children.map(child => renderParcelCard(child as Parcel, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Загрузка посылок...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold">Конфигуратор упаковки</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Панель действий */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Добавить коробку
          </button>
          
          {FLAGS.CAMERA_QR_ENABLED && (
            <button
              onClick={() => {/* TODO: открыть сканер */}}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              📷 Сканировать ярлык
            </button>
          )}
          
          {FLAGS.PACK_LABELS_ENABLED && selectedParcels.length > 0 && (
            <button
              onClick={handleGenerateLabels}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              🖨 Печать этикеток ({selectedParcels.length})
            </button>
          )}
        </div>
      </div>

      {/* Список посылок */}
      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {parcels.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Посылки не найдены</p>
            <p className="text-sm">Создайте первую посылку, нажав "Добавить коробку"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {parcels.map(parcel => renderParcelCard(parcel))}
          </div>
        )}
      </div>

      {/* Кнопка завершения */}
      <div className="p-4 border-t bg-gray-50">
        <button
          onClick={() => {/* TODO: завершить упаковку */}}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Завершить упаковку
        </button>
      </div>
    </div>
  );
}





