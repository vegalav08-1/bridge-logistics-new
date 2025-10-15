import React, { useState, useEffect } from 'react';
import { FLAGS } from '@yp/shared';

export interface UserSettings {
  id: string;
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  quietHoursFrom?: number;
  quietHoursTo?: number;
  preferredLang?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationSettingsProps {
  token?: string;
  onSettingsChange?: (settings: UserSettings) => void;
  className?: string;
}

export function NotificationSettings({ 
  token, 
  onSettingsChange,
  className = '' 
}: NotificationSettingsProps) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка настроек
  const fetchSettings = async () => {
    if (!token || !FLAGS.NOTIFICATIONS_V2_ENABLED) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/settings/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notification settings');
      }

      const data = await response.json();
      setSettings(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching notification settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Сохранение настроек
  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    if (!token) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to save notification settings');
      }

      const data = await response.json();
      setSettings(data);
      
      if (onSettingsChange) {
        onSettingsChange(data);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error saving notification settings:', err);
    } finally {
      setSaving(false);
    }
  };

  // Загружаем настройки при монтировании
  useEffect(() => {
    fetchSettings();
  }, [token]);

  // Обработчики изменений
  const handlePushToggle = (enabled: boolean) => {
    if (settings) {
      saveSettings({ ...settings, pushEnabled: enabled });
    }
  };

  const handleEmailToggle = (enabled: boolean) => {
    if (settings) {
      saveSettings({ ...settings, emailEnabled: enabled });
    }
  };

  const handleQuietHoursChange = (from: number | null | undefined, to: number | null | undefined) => {
    if (settings) {
      saveSettings({ 
        ...settings, 
        quietHoursFrom: from ?? undefined, 
        quietHoursTo: to ?? undefined 
      });
    }
  };

  const handleLanguageChange = (lang: string) => {
    if (settings) {
      saveSettings({ ...settings, preferredLang: lang });
    }
  };

  if (!FLAGS.NOTIFICATIONS_V2_ENABLED) {
    return null;
  }

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-red-600 text-center">
          <p className="mb-2">{error}</p>
          <button
            onClick={fetchSettings}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className={`p-6 ${className}`}>
        <p className="text-gray-500 text-center">Настройки недоступны</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Настройки уведомлений
        </h3>

        <div className="space-y-6">
          {/* Push уведомления */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Push уведомления</h4>
              <p className="text-sm text-gray-500">
                Получать уведомления в браузере
              </p>
            </div>
            <Switch
              enabled={settings.pushEnabled}
              onChange={handlePushToggle}
              disabled={saving}
            />
          </div>

          {/* Email уведомления */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Email уведомления</h4>
              <p className="text-sm text-gray-500">
                Получать уведомления на почту
              </p>
            </div>
            <Switch
              enabled={settings.emailEnabled}
              onChange={handleEmailToggle}
              disabled={saving}
            />
          </div>

          {/* Тихие часы */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Тихие часы</h4>
            <p className="text-sm text-gray-500 mb-4">
              Не отправлять уведомления в указанное время
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  С
                </label>
                <select
                  value={settings.quietHoursFrom ?? ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : null;
                    handleQuietHoursChange(value, settings.quietHoursTo);
                  }}
                  disabled={saving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">Выключено</option>
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  До
                </label>
                <select
                  value={settings.quietHoursTo ?? ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : null;
                    handleQuietHoursChange(settings.quietHoursFrom, value);
                  }}
                  disabled={saving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">Выключено</option>
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Язык уведомлений */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Язык уведомлений</h4>
            <p className="text-sm text-gray-500 mb-3">
              Выберите язык для уведомлений
            </p>
            <select
              value={settings.preferredLang || 'ru'}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </div>

          {/* Статус сохранения */}
          {saving && (
            <div className="flex items-center text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Сохранение...
            </div>
          )}

          {/* Кнопка паузы */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                // Пауза на 24 часа
                const now = new Date();
                const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                const from = now.getHours();
                const to = tomorrow.getHours();
                handleQuietHoursChange(from, to);
              }}
              disabled={saving}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Пауза на 24 часа
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент переключателя
interface SwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

function Switch({ enabled, onChange, disabled = false }: SwitchProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${enabled ? 'bg-blue-600' : 'bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${enabled ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
}
