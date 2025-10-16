import React, { useState, useEffect, useRef } from 'react';
import { FLAGS } from '@yp/shared';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  chatId?: string;
  messageId?: string;
}

interface NotificationBellProps {
  token?: string;
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

export function NotificationBell({ 
  token, 
  onNotificationClick,
  className = '' 
}: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие дропдауна при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Загрузка уведомлений
  const fetchNotifications = async () => {
    if (!token || !FLAGS.NOTIFICATIONS_V2_ENABLED) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Загружаем уведомления при открытии
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Отметка уведомления как прочитанного
  const markAsRead = async (notificationId: string) => {
    if (!token) return;

    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Обновляем локальное состояние
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, isRead: true }
            : n
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Обработка клика по уведомлению
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    
    setIsOpen(false);
  };

  // Получение иконки для типа уведомления
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat_message':
        return '💬';
      case 'status_change':
        return '📦';
      case 'mention':
        return '👤';
      case 'finance_op':
        return '💰';
      case 'offer_created':
        return '🧾';
      default:
        return '🔔';
    }
  };

  // Форматирование времени
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'сейчас';
    if (diffInMinutes < 60) return `${diffInMinutes}м`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}ч`;
    return `${Math.floor(diffInMinutes / 1440)}д`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!FLAGS.NOTIFICATIONS_V2_ENABLED) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Кнопка звонка */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full transition-colors"
        aria-label="Уведомления"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-5-5V7a7 7 0 00-14 0v5l-5 5h5m0 0v1a3 3 0 006 0v-1m-6 0h6" 
          />
        </svg>
        
        {/* Бейдж с количеством непрочитанных */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Дропдаун с уведомлениями */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Заголовок */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Уведомления</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Список уведомлений */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2">Загрузка...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                <p>{error}</p>
                <button
                  onClick={fetchNotifications}
                  className="mt-2 text-sm text-blue-500 hover:text-blue-700"
                >
                  Попробовать снова
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="text-4xl mb-2">🔔</div>
                <p>Нет уведомлений</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    p-4 border-b border-gray-100 cursor-pointer transition-colors
                    hover:bg-gray-50
                    ${!notification.isRead ? 'bg-green-50 border-l-4 border-l-green-500' : ''}
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`
                          text-sm font-medium truncate
                          ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}
                        `}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      {notification.body && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.body}
                        </p>
                      )}
                    </div>
                    {!notification.isRead && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Футер */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  // Переход на страницу всех уведомлений
                  window.location.href = '/notifications';
                }}
                className="w-full text-center text-sm text-blue-500 hover:text-blue-700 font-medium"
              >
                Посмотреть все уведомления
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}







