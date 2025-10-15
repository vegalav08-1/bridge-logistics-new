'use client';

import React, { useState, useEffect } from 'react';
import { outboxQueue } from '@/modules/offline/outbox';

interface NetworkBadgeProps {
  className?: string;
}

export function NetworkBadge({ className = '' }: NetworkBadgeProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueStats, setQueueStats] = useState({
    pending: 0,
    sending: 0,
    failed: 0,
    total: 0,
  });
  const [showQueue, setShowQueue] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Обновляем статистику очереди
    const updateQueueStats = async () => {
      const stats = await outboxQueue.getQueueStats();
      setQueueStats(stats);
    };

    updateQueueStats();
    const interval = setInterval(updateQueueStats, 5000);

    // Слушаем события от outbox
    const handleOutboxEvent = () => {
      updateQueueStats();
    };

    window.addEventListener('outbox:sent', handleOutboxEvent);
    window.addEventListener('outbox:failed', handleOutboxEvent);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('outbox:sent', handleOutboxEvent);
      window.removeEventListener('outbox:failed', handleOutboxEvent);
      clearInterval(interval);
    };
  }, []);

  const handleForceSync = async () => {
    await outboxQueue.forceProcess();
    setShowQueue(false);
  };

  const handleClearQueue = async () => {
    if (confirm('Очистить очередь отправки? Это удалит все неотправленные сообщения.')) {
      await outboxQueue.clearQueue();
      setShowQueue(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Индикатор сети */}
      <button
        onClick={() => setShowQueue(!showQueue)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          isOnline
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-red-100 text-red-700 hover:bg-red-200'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm font-medium">
          {isOnline ? 'Онлайн' : 'Офлайн'}
        </span>
        {queueStats.total > 0 && (
          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
            {queueStats.total}
          </div>
        )}
      </button>

      {/* Модал очереди */}
      {showQueue && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Очередь отправки</h3>
              <button
                onClick={() => setShowQueue(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 gap-4 mb-4">
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

            {/* Действия */}
            <div className="space-y-2">
              {!isOnline && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span>Сообщения будут отправлены при восстановлении сети</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleForceSync}
                disabled={!isOnline || queueStats.total === 0}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Отправить сейчас
              </button>

              {queueStats.failed > 0 && (
                <button
                  onClick={handleClearQueue}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Очистить очередь
                </button>
              )}
            </div>

            {/* Информация */}
            <div className="mt-4 text-xs text-gray-500">
              <div>• Сообщения сохраняются локально</div>
              <div>• Автоматическая отправка при появлении сети</div>
              <div>• Повторные попытки при ошибках</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент для отображения статуса в мобильном меню
export function MobileNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueStats, setQueueStats] = useState({ total: 0 });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const updateStats = async () => {
      const stats = await outboxQueue.getQueueStats();
      setQueueStats(stats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
      <span>{isOnline ? 'Онлайн' : 'Офлайн'}</span>
      {queueStats.total > 0 && (
        <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
          {queueStats.total}
        </div>
      )}
    </div>
  );
}




