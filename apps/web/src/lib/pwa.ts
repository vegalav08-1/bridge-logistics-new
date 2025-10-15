'use client';

import { useEffect, useState } from 'react';
import { FLAGS } from '@yp/shared';

// Типы для PWA
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isSupported: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  canInstall: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

// Хук для работы с PWA
export function usePWA(): PWAState & {
  install: () => Promise<void>;
  update: () => void;
} {
  const [state, setState] = useState<PWAState>({
    isSupported: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    canInstall: false,
    installPrompt: null,
  });

  useEffect(() => {
    if (!FLAGS.PWA_ENABLED) return;

    // Проверяем поддержку PWA
    const isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
    
    // Проверяем, установлено ли приложение
    const isInstalled = typeof window !== 'undefined' && (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );

    setState(prev => ({
      ...prev,
      isSupported,
      isInstalled,
    }));

    // Регистрируем Service Worker
    if (isSupported) {
      registerServiceWorker();
    }

    // Слушаем события сети
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    // Слушаем событие beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setState(prev => ({
        ...prev,
        canInstall: true,
        installPrompt: e as BeforeInstallPromptEvent,
      }));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    // Слушаем событие appinstalled
    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isInstalled: true,
        canInstall: false,
        installPrompt: null,
      }));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('appinstalled', handleAppInstalled);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      }
    };
  }, []);

  const install = async () => {
    if (!state.installPrompt) return;

    try {
      await state.installPrompt.prompt();
      const choiceResult = await state.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
      } else {
        console.log('PWA: User dismissed the install prompt');
      }
    } catch (error) {
      console.error('PWA: Install failed:', error);
    }
  };

  const update = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }
      });
    }
  };

  return {
    ...state,
    install,
    update,
  };
}

// Регистрация Service Worker
async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.warn('PWA: Service Worker not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('PWA: Service Worker registered successfully:', registration);

    // Обработка обновлений
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Новый Service Worker доступен
            console.log('PWA: New Service Worker available');
            // Можно показать уведомление об обновлении
          }
        });
      }
    });

    // Обработка сообщений от Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'SYNC_OUTBOX') {
        console.log('PWA: Outbox sync requested');
        // Можно запустить синхронизацию outbox
      }
    });

  } catch (error) {
    console.error('PWA: Service Worker registration failed:', error);
  }
}

// Утилиты для работы с PWA
export const pwaUtils = {
  // Проверка поддержки функций
  isSupported: {
    serviceWorker: typeof window !== 'undefined' && 'serviceWorker' in navigator,
    pushManager: typeof window !== 'undefined' && 'PushManager' in window,
    notification: typeof window !== 'undefined' && 'Notification' in window,
    backgroundSync: typeof window !== 'undefined' && 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
  },

  // Запрос разрешений
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  },

  // Подписка на push уведомления
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      return subscription;
    } catch (error) {
      console.error('PWA: Push subscription failed:', error);
      return null;
    }
  },

  // Отписка от push уведомлений
  async unsubscribeFromPush(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('PWA: Push unsubscription failed:', error);
      return false;
    }
  },

  // Очистка кэша
  async clearCache(): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
      console.log('PWA: Cache cleared');
    } catch (error) {
      console.error('PWA: Cache clear failed:', error);
    }
  },

  // Получение информации о кэше
  async getCacheInfo(): Promise<{
    size: number;
    entries: number;
  }> {
    if (!('caches' in window)) {
      return { size: 0, entries: 0 };
    }

    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      let totalEntries = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        totalEntries += keys.length;

        // Примерная оценка размера (не точная)
        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return { size: totalSize, entries: totalEntries };
    } catch (error) {
      console.error('PWA: Cache info failed:', error);
      return { size: 0, entries: 0 };
    }
  },
};

// Компонент для отображения статуса PWA
export function PWAStatus() {
  const pwa = usePWA();

  if (!pwa.isSupported) {
    return null; // Не рендерим JSX в .ts файле
  }

  return null; // Компонент перенесен в отдельный .tsx файл
}
