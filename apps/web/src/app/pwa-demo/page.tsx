'use client';

import React, { useState, useEffect } from 'react';
import { usePWAFeatures } from '@/components/PWAProvider';
import { NetworkBadge } from '@/components/NetworkBadge';
import { MessageInput } from '@/components/chat/MessageInput';
import { CameraSheet } from '@/modules/offline/camera';
import { QRScannerModal } from '@/modules/offline/qr-scanner';
import { outboxQueue } from '@/modules/offline/outbox';
import { FLAGS } from '@yp/shared';

export default function PWADemoPage() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [queueStats, setQueueStats] = useState({
    pending: 0,
    sending: 0,
    failed: 0,
    total: 0,
  });
  const [cacheInfo, setCacheInfo] = useState({ size: 0, entries: 0 });

  const pwa = usePWAFeatures();

  useEffect(() => {
    // Обновляем статистику очереди
    const updateStats = async () => {
      const stats = await outboxQueue.getQueueStats();
      setQueueStats(stats);
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);

    // Получаем информацию о кэше
    if (pwa.isSupported) {
      import('@/lib/pwa').then(({ pwaUtils }) => {
        pwaUtils.getCacheInfo().then(setCacheInfo);
      });
    }

    return () => clearInterval(interval);
  }, [pwa.isSupported]);

  const handleCameraCapture = (file: File, compressed: any) => {
    console.log('Camera capture:', { file, compressed });
    alert(`Фото сделано! Размер: ${compressed.originalSize} -> ${compressed.compressedSize} байт`);
  };

  const handleQRScan = (result: string) => {
    console.log('QR scan result:', result);
    alert(`QR код отсканирован: ${result}`);
  };

  const handleTestMessage = async () => {
    try {
      const messageId = await outboxQueue.enqueueMessage('demo-chat', 'Тестовое сообщение из демо');
      alert(`Сообщение добавлено в очередь: ${messageId}`);
    } catch (error) {
      console.error('Error queuing message:', error);
      alert('Ошибка добавления сообщения в очередь');
    }
  };

  const handleClearCache = async () => {
    try {
      const { pwaUtils } = await import('@/lib/pwa');
      await pwaUtils.clearCache();
      alert('Кэш очищен');
      window.location.reload();
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Ошибка очистки кэша');
    }
  };

  const handleForceSync = async () => {
    try {
      await outboxQueue.forceProcess();
      alert('Синхронизация запущена');
    } catch (error) {
      console.error('Error syncing:', error);
      alert('Ошибка синхронизации');
    }
  };

  if (!FLAGS.PWA_ENABLED) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">PWA отключен</h1>
          <p className="text-gray-600">Включите флаг PWA_ENABLED в constants.ts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PWA Demo</h1>
              <p className="text-gray-600">Тестирование PWA функций</p>
            </div>
            <NetworkBadge />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Статус PWA */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Статус PWA</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${pwa.isSupported ? 'bg-green-500' : 'bg-red-500'}`} />
              <div className="text-sm font-medium">Поддержка</div>
              <div className="text-xs text-gray-500">{pwa.isSupported ? 'Да' : 'Нет'}</div>
            </div>
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${pwa.isInstalled ? 'bg-green-500' : 'bg-gray-400'}`} />
              <div className="text-sm font-medium">Установлено</div>
              <div className="text-xs text-gray-500">{pwa.isInstalled ? 'Да' : 'Нет'}</div>
            </div>
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${pwa.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <div className="text-sm font-medium">Сеть</div>
              <div className="text-xs text-gray-500">{pwa.isOnline ? 'Онлайн' : 'Офлайн'}</div>
            </div>
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${pwa.canInstall ? 'bg-blue-500' : 'bg-gray-400'}`} />
              <div className="text-sm font-medium">Установка</div>
              <div className="text-xs text-gray-500">{pwa.canInstall ? 'Доступна' : 'Нет'}</div>
            </div>
          </div>
        </div>

        {/* Функции */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Функции</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${pwa.canUseCamera ? 'bg-green-500' : 'bg-red-500'}`} />
              <div className="text-sm font-medium">Камера</div>
              <div className="text-xs text-gray-500">{pwa.canUseCamera ? 'Да' : 'Нет'}</div>
            </div>
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${pwa.canUseNotifications ? 'bg-green-500' : 'bg-red-500'}`} />
              <div className="text-sm font-medium">Уведомления</div>
              <div className="text-xs text-gray-500">{pwa.canUseNotifications ? 'Да' : 'Нет'}</div>
            </div>
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${pwa.canUseBackgroundSync ? 'bg-green-500' : 'bg-red-500'}`} />
              <div className="text-sm font-medium">Background Sync</div>
              <div className="text-xs text-gray-500">{pwa.canUseBackgroundSync ? 'Да' : 'Нет'}</div>
            </div>
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${pwa.isOffline ? 'bg-orange-500' : 'bg-green-500'}`} />
              <div className="text-sm font-medium">Офлайн</div>
              <div className="text-xs text-gray-500">{pwa.isOffline ? 'Да' : 'Нет'}</div>
            </div>
          </div>
        </div>

        {/* Статистика очереди */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Очередь отправки</h2>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{queueStats.pending}</div>
              <div className="text-sm text-gray-600">Ожидают</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{queueStats.sending}</div>
              <div className="text-sm text-gray-600">Отправляются</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{queueStats.failed}</div>
              <div className="text-sm text-gray-600">Ошибки</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{queueStats.total}</div>
              <div className="text-sm text-gray-600">Всего</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleTestMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Добавить тестовое сообщение
            </button>
            <button
              onClick={handleForceSync}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Синхронизировать
            </button>
          </div>
        </div>

        {/* Кэш */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Кэш</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{Math.round(cacheInfo.size / 1024)} KB</div>
              <div className="text-sm text-gray-600">Размер</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{cacheInfo.entries}</div>
              <div className="text-sm text-gray-600">Записей</div>
            </div>
          </div>
          <button
            onClick={handleClearCache}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Очистить кэш
          </button>
        </div>

        {/* Тестирование функций */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Тестирование</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setIsCameraOpen(true)}
              disabled={!pwa.canUseCamera}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-2xl mb-2">📷</div>
              <div className="font-medium">Камера</div>
              <div className="text-sm text-gray-500">Сделать фото</div>
            </button>
            
            <button
              onClick={() => setIsQRScannerOpen(true)}
              disabled={!pwa.canUseCamera}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-2xl mb-2">📱</div>
              <div className="font-medium">QR Сканер</div>
              <div className="text-sm text-gray-500">Сканировать код</div>
            </button>
          </div>
        </div>

        {/* Демо ввода сообщений */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Демо ввода сообщений</h2>
          <MessageInput
            chatId="demo-chat"
            onMessageSent={(message) => {
              console.log('Message sent:', message);
              alert('Сообщение отправлено!');
            }}
          />
        </div>
      </div>

      {/* Модалы */}
      <CameraSheet
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
      
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScan={handleQRScan}
      />
    </div>
  );
}




