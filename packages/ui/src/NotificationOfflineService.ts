import { FLAGS } from '@yp/shared';

export interface OfflineNotification {
  id: string;
  type: string;
  title: string;
  body?: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  chatId?: string;
  messageId?: string;
  synced: boolean; // Синхронизировано ли с сервером
}

export interface OfflineAction {
  id: string;
  type: 'mark_read' | 'delete' | 'mark_all_read';
  notificationId?: string;
  timestamp: string;
  synced: boolean;
}

class NotificationOfflineService {
  private dbName = 'BridgeNotifications';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  /**
   * Инициализация IndexedDB
   */
  async initialize(): Promise<void> {
    if (!FLAGS.NOTIFICATIONS_V2_ENABLED) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized for notifications');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Создаем хранилище для уведомлений
        if (!db.objectStoreNames.contains('notifications')) {
          const notificationStore = db.createObjectStore('notifications', { keyPath: 'id' });
          notificationStore.createIndex('createdAt', 'createdAt');
          notificationStore.createIndex('isRead', 'isRead');
          notificationStore.createIndex('synced', 'synced');
        }

        // Создаем хранилище для offline действий
        if (!db.objectStoreNames.contains('actions')) {
          const actionStore = db.createObjectStore('actions', { keyPath: 'id' });
          actionStore.createIndex('timestamp', 'timestamp');
          actionStore.createIndex('synced', 'synced');
        }
      };
    });
  }

  /**
   * Сохранение уведомления в IndexedDB
   */
  async saveNotification(notification: OfflineNotification): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['notifications'], 'readwrite');
      const store = transaction.objectStore('notifications');
      const request = store.put(notification);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Получение всех уведомлений из IndexedDB
   */
  async getNotifications(): Promise<OfflineNotification[]> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['notifications'], 'readonly');
      const store = transaction.objectStore('notifications');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Получение непрочитанных уведомлений
   */
  async getUnreadNotifications(): Promise<OfflineNotification[]> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['notifications'], 'readonly');
      const store = transaction.objectStore('notifications');
      const index = store.index('isRead');
      const request = index.getAll(false as any);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Отметка уведомления как прочитанного
   */
  async markAsRead(notificationId: string): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    // Обновляем в IndexedDB
    const transaction = this.db!.transaction(['notifications'], 'readwrite');
    const store = transaction.objectStore('notifications');
    const getRequest = store.get(notificationId);

    getRequest.onsuccess = () => {
      const notification = getRequest.result;
      if (notification) {
        notification.isRead = true;
        store.put(notification);
      }
    };

    // Сохраняем offline действие
    await this.saveOfflineAction({
      id: `mark_read_${Date.now()}`,
      type: 'mark_read',
      notificationId,
      timestamp: new Date().toISOString(),
      synced: false
    });
  }

  /**
   * Удаление уведомления
   */
  async deleteNotification(notificationId: string): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    // Удаляем из IndexedDB
    const transaction = this.db!.transaction(['notifications'], 'readwrite');
    const store = transaction.objectStore('notifications');
    store.delete(notificationId);

    // Сохраняем offline действие
    await this.saveOfflineAction({
      id: `delete_${Date.now()}`,
      type: 'delete',
      notificationId,
      timestamp: new Date().toISOString(),
      synced: false
    });
  }

  /**
   * Отметка всех уведомлений как прочитанных
   */
  async markAllAsRead(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    // Обновляем все уведомления в IndexedDB
    const notifications = await this.getNotifications();
    const transaction = this.db!.transaction(['notifications'], 'readwrite');
    const store = transaction.objectStore('notifications');

    notifications.forEach(notification => {
      notification.isRead = true;
      store.put(notification);
    });

    // Сохраняем offline действие
    await this.saveOfflineAction({
      id: `mark_all_read_${Date.now()}`,
      type: 'mark_all_read',
      timestamp: new Date().toISOString(),
      synced: false
    });
  }

  /**
   * Сохранение offline действия
   */
  private async saveOfflineAction(action: OfflineAction): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const request = store.put(action);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Получение несинхронизированных действий
   */
  async getUnsyncedActions(): Promise<OfflineAction[]> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readonly');
      const store = transaction.objectStore('actions');
      const index = store.index('synced');
      const request = index.getAll(false as any);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Отметка действия как синхронизированного
   */
  async markActionAsSynced(actionId: string): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const getRequest = store.get(actionId);

      getRequest.onsuccess = () => {
        const action = getRequest.result;
        if (action) {
          action.synced = true;
          store.put(action);
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Синхронизация с сервером
   */
  async syncWithServer(token: string): Promise<void> {
    if (!FLAGS.NOTIFICATIONS_V2_ENABLED) {
      return;
    }

    try {
      // Получаем несинхронизированные действия
      const unsyncedActions = await this.getUnsyncedActions();

      for (const action of unsyncedActions) {
        try {
          if (action.type === 'mark_read' && action.notificationId) {
            await fetch(`/api/notifications/${action.notificationId}/read`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
          } else if (action.type === 'delete' && action.notificationId) {
            await fetch(`/api/notifications/${action.notificationId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
          } else if (action.type === 'mark_all_read') {
            await fetch('/api/notifications/read-all', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
          }

          // Отмечаем действие как синхронизированное
          await this.markActionAsSynced(action.id);
        } catch (error) {
          console.error('Error syncing action:', action, error);
        }
      }

      // Загружаем свежие уведомления с сервера
      await this.loadNotificationsFromServer(token);
    } catch (error) {
      console.error('Error syncing with server:', error);
    }
  }

  /**
   * Загрузка уведомлений с сервера
   */
  private async loadNotificationsFromServer(token: string): Promise<void> {
    try {
      const response = await fetch('/api/notifications?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const notifications = data.notifications || [];

        // Сохраняем уведомления в IndexedDB
        for (const notification of notifications) {
          await this.saveNotification({
            ...notification,
            synced: true
          });
        }
      }
    } catch (error) {
      console.error('Error loading notifications from server:', error);
    }
  }

  /**
   * Очистка старых данных
   */
  async cleanup(): Promise<void> {
    if (!this.db) {
      return;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Удаляем старые уведомления
    const notifications = await this.getNotifications();
    const oldNotifications = notifications.filter(
      n => new Date(n.createdAt) < thirtyDaysAgo
    );

    const transaction = this.db.transaction(['notifications'], 'readwrite');
    const store = transaction.objectStore('notifications');

    oldNotifications.forEach(notification => {
      store.delete(notification.id);
    });
  }
}

// Глобальный экземпляр сервиса
let offlineService: NotificationOfflineService | null = null;

export function getNotificationOfflineService(): NotificationOfflineService {
  if (!offlineService) {
    offlineService = new NotificationOfflineService();
  }
  return offlineService;
}

export default NotificationOfflineService;
