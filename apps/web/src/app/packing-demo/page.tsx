'use client';

import React, { useState } from 'react';
import { PackingConfigurator, PackingPresets, ParcelForm, Parcel3DViewer } from '@yp/ui';
import { FLAGS } from '@yp/shared';

export default function PackingDemoPage() {
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showParcelForm, setShowParcelForm] = useState(false);
  const [show3DViewer, setShow3DViewer] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<any>(null);

  const mockChatId = 'demo-chat-id';
  const mockChatStatus = 'PACK';

  const handleCreateParcel = (data: any) => {
    console.log('Creating parcel:', data);
    setShowParcelForm(false);
    // В реальном приложении здесь будет API вызов
  };

  const handle3DView = (parcel: any) => {
    setSelectedParcel(parcel);
    setShow3DViewer(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          S16 — Конфигуратор упаковки Pro (Demo)
        </h1>

        {/* Feature Flags Status */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Feature Flags Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-3 rounded ${FLAGS.PACK_PRO_ENABLED ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-medium">PACK_PRO_ENABLED</div>
              <div className="text-sm">{FLAGS.PACK_PRO_ENABLED ? '✅ Включен' : '❌ Отключен'}</div>
            </div>
            <div className={`p-3 rounded ${FLAGS.PACK_LABELS_ENABLED ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-medium">PACK_LABELS_ENABLED</div>
              <div className="text-sm">{FLAGS.PACK_LABELS_ENABLED ? '✅ Включен' : '❌ Отключен'}</div>
            </div>
            <div className={`p-3 rounded ${FLAGS.PACK_PRESETS_ENABLED ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-medium">PACK_PRESETS_ENABLED</div>
              <div className="text-sm">{FLAGS.PACK_PRESETS_ENABLED ? '✅ Включен' : '❌ Отключен'}</div>
            </div>
            <div className={`p-3 rounded ${FLAGS.PACK_3D_ENABLED ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-medium">PACK_3D_ENABLED</div>
              <div className="text-sm">{FLAGS.PACK_3D_ENABLED ? '✅ Включен' : '❌ Отключен'}</div>
            </div>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Demo Controls</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setShowConfigurator(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              📦 Конфигуратор
            </button>
            <button
              onClick={() => setShowPresets(true)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              ⚙️ Пресеты
            </button>
            <button
              onClick={() => setShowParcelForm(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              ➕ Создать посылку
            </button>
            <button
              onClick={() => handle3DView({
                length: 30,
                width: 20,
                height: 15,
                kind: 'box'
              })}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              🎯 3D Просмотр
            </button>
          </div>
        </div>

        {/* API Endpoints Info */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">API Endpoints</h2>
          <div className="space-y-2 text-sm">
            <div><strong>GET</strong> /api/packing/presets - Список пресетов</div>
            <div><strong>POST</strong> /api/packing/presets - Создать пресет</div>
            <div><strong>GET</strong> /api/shipments/:chatId/parcels - Список посылок</div>
            <div><strong>POST</strong> /api/shipments/:chatId/parcels - Создать посылку</div>
            <div><strong>PATCH</strong> /api/parcels/:id - Обновить посылку</div>
            <div><strong>POST</strong> /api/parcels/:id/move - Переместить посылку</div>
            <div><strong>DELETE</strong> /api/parcels/:id - Удалить посылку</div>
            <div><strong>POST</strong> /api/packing/labels - Генерировать этикетки</div>
            <div><strong>GET</strong> /api/packing/labels/:id/url - URL этикетки</div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Реализованные функции</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">📦 Упаковка</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ Создание/редактирование Parcel</li>
                <li>✅ Иерархия посылок (MERGE)</li>
                <li>✅ Автогенерация кодов</li>
                <li>✅ Вычисление объема</li>
                <li>✅ Валидация размеров/веса</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">⚙️ Пресеты</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ Создание пресетов админом</li>
                <li>✅ Правила ценообразования</li>
                <li>✅ Пресет по умолчанию</li>
                <li>✅ JSON хранение настроек</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">💰 Финансы</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ Автооперации упаковки</li>
                <li>✅ Сторнирование при изменениях</li>
                <li>✅ Фикс/за кг ценообразование</li>
                <li>✅ Страховка в %</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🏷️ Этикетки</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ PDF генерация (A7/A6)</li>
                <li>✅ QR коды</li>
                <li>✅ Штрих-коды</li>
                <li>✅ Presigned URLs</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🎯 3D Визуализация</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ Изометрическая проекция</li>
                <li>✅ Пропорциональное масштабирование</li>
                <li>✅ Цветовая кодировка типов</li>
                <li>✅ Информационные подписи</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🔄 Real-time</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ События создания/обновления</li>
                <li>✅ События перемещения/удаления</li>
                <li>✅ События генерации этикеток</li>
                <li>✅ WebSocket интеграция</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile-First Design */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Mobile-First Design</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded">
              <div className="font-medium">📱 Мобильная панель</div>
              <div className="text-sm text-gray-600">Одноколоночная форма, крупные кнопки</div>
            </div>
            <div className="p-3 bg-green-50 rounded">
              <div className="font-medium">🎯 Touch-friendly</div>
              <div className="text-sm text-gray-600">Удобные жесты, свайпы</div>
            </div>
            <div className="p-3 bg-purple-50 rounded">
              <div className="font-medium">📐 Адаптивная сетка</div>
              <div className="text-sm text-gray-600">Responsive layout</div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальные окна */}
      {showConfigurator && (
        <PackingConfigurator
          chatId={mockChatId}
          chatStatus={mockChatStatus}
          onClose={() => setShowConfigurator(false)}
        />
      )}

      {showPresets && (
        <PackingPresets
          onClose={() => setShowPresets(false)}
        />
      )}

      {showParcelForm && (
        <ParcelForm
          chatId={mockChatId}
          onSave={handleCreateParcel}
          onCancel={() => setShowParcelForm(false)}
        />
      )}

      {show3DViewer && selectedParcel && (
        <Parcel3DViewer
          length={selectedParcel.length}
          width={selectedParcel.width}
          height={selectedParcel.height}
          kind={selectedParcel.kind}
          onClose={() => {
            setShow3DViewer(false);
            setSelectedParcel(null);
          }}
        />
      )}
    </div>
  );
}
