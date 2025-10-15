'use client';

import React, { useEffect, useState } from 'react';
import { usePWA } from '@/lib/pwa';
import { FLAGS } from '@yp/shared';

interface PWAProviderProps {
  children: React.ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const pwa = usePWA();

  useEffect(() => {
    if (!FLAGS.PWA_ENABLED) return;

    // Регистрируем Service Worker при загрузке
    if (pwa.isSupported && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        console.log('PWA: Service Worker ready');
      });
    }

    // Показываем уведомление об установке
    if (pwa.canInstall && !pwa.isInstalled) {
      // Можно показать баннер или уведомление
      console.log('PWA: Installation available');
    }

  }, [pwa.isSupported, pwa.canInstall, pwa.isInstalled]);

  return (
    <>
      {children}
      
      {/* PWA Install Banner */}
      {FLAGS.PWA_ENABLED && pwa.canInstall && !pwa.isInstalled && (
        <PWAInstallBanner onInstall={pwa.install} />
      )}
    </>
  );
}

// Компонент баннера установки
function PWAInstallBanner({ onInstall }: { onInstall: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            📱
          </div>
          <div>
            <div className="font-semibold">Установить Bridge</div>
            <div className="text-sm opacity-90">Доступ к приложению без браузера</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onInstall}
            className="bg-white text-blue-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Установить
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-gray-200 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Хук для использования PWA функций в компонентах
export function usePWAFeatures() {
  const pwa = usePWA();

  return {
    ...pwa,
    // Дополнительные утилиты
    isOffline: !pwa.isOnline,
    canUseCamera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    canUseNotifications: 'Notification' in window && Notification.permission === 'granted',
    canUseBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
  };
}
