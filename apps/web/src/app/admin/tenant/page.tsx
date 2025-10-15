'use client';

import { useState } from 'react';
import { useACL } from '@/lib/acl/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  Settings,
  Save,
  Globe,
  Shield,
  HardDrive,
  Bell,
  Lock,
  Users,
  Mail,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from '@/components/icons';

export default function TenantSettingsPage() {
  const { ctx } = useACL();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      tenantName: 'Bridge Logistics',
      domain: 'bridge.local',
      timezone: 'Europe/Moscow',
      language: 'ru',
      currency: 'RUB'
    },
    security: {
      sessionTimeout: 30,
      passwordPolicy: 'strong',
      twoFactorAuth: true,
      ipWhitelist: '',
      auditLogging: true
    },
    features: {
      chatEnabled: true,
      fileUploadEnabled: true,
      scannerEnabled: true,
      notificationsEnabled: true,
      analyticsEnabled: true
    },
    limits: {
      maxUsers: 100,
      maxStorage: 1000,
      maxFileSize: 50,
      maxChats: 500
    },
    integrations: {
      emailProvider: 'smtp',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: ''
    }
  });

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    alert('Настройки сохранены');
  };

  const handleReset = () => {
    if (confirm('Сбросить все настройки к значениям по умолчанию?')) {
      // Reset to default values
      alert('Настройки сброшены');
    }
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  if (ctx.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Доступ запрещен</h2>
          <p className="text-gray-600">У вас нет прав для доступа к настройкам тенанта</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Настройки тенанта</h1>
        <p className="text-gray-600">Управление общими настройками системы</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'general', label: 'Общие', icon: Globe },
              { id: 'security', label: 'Безопасность', icon: Shield },
              { id: 'features', label: 'Функции', icon: Activity },
              { id: 'limits', label: 'Лимиты', icon: HardDrive },
              { id: 'integrations', label: 'Интеграции', icon: Mail }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 inline mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Общие настройки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название тенанта
                  </label>
                  <Input
                    value={settings.general.tenantName}
                    onChange={(e) => updateSetting('general', 'tenantName', e.target.value)}
                    placeholder="Название компании"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Домен
                  </label>
                  <Input
                    value={settings.general.domain}
                    onChange={(e) => updateSetting('general', 'domain', e.target.value)}
                    placeholder="company.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Часовой пояс
                  </label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Europe/Moscow">Москва (UTC+3)</option>
                    <option value="Europe/London">Лондон (UTC+0)</option>
                    <option value="America/New_York">Нью-Йорк (UTC-5)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Язык
                  </label>
                  <select
                    value={settings.general.language}
                    onChange={(e) => updateSetting('general', 'language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Валюта
                  </label>
                  <select
                    value={settings.general.currency}
                    onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="RUB">RUB</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Настройки безопасности
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Таймаут сессии (минуты)
                  </label>
                  <Input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    min="5"
                    max="480"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Политика паролей
                  </label>
                  <select
                    value={settings.security.passwordPolicy}
                    onChange={(e) => updateSetting('security', 'passwordPolicy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="weak">Слабая</option>
                    <option value="medium">Средняя</option>
                    <option value="strong">Сильная</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="twoFactorAuth"
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="twoFactorAuth" className="ml-2 text-sm text-gray-700">
                    Двухфакторная аутентификация
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="auditLogging"
                    checked={settings.security.auditLogging}
                    onChange={(e) => updateSetting('security', 'auditLogging', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="auditLogging" className="ml-2 text-sm text-gray-700">
                    Ведение журнала аудита
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Белый список IP (по одному на строку)
                </label>
                <Textarea
                  value={settings.security.ipWhitelist}
                  onChange={(e) => updateSetting('security', 'ipWhitelist', e.target.value)}
                  placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Features Settings */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Функции системы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'chatEnabled', label: 'Чат', icon: Users },
                  { key: 'fileUploadEnabled', label: 'Загрузка файлов', icon: FileText },
                  { key: 'scannerEnabled', label: 'Сканер', icon: Activity },
                  { key: 'notificationsEnabled', label: 'Уведомления', icon: Bell },
                  { key: 'analyticsEnabled', label: 'Аналитика', icon: Activity }
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center p-3 border border-gray-200 rounded-lg">
                    <Icon className="h-5 w-5 text-gray-500 mr-3" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700">{label}</label>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.features[key as keyof typeof settings.features] as boolean}
                      onChange={(e) => updateSetting('features', key, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Limits Settings */}
      {activeTab === 'limits' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HardDrive className="h-5 w-5 mr-2" />
                Лимиты системы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Максимум пользователей
                  </label>
                  <Input
                    type="number"
                    value={settings.limits.maxUsers}
                    onChange={(e) => updateSetting('limits', 'maxUsers', parseInt(e.target.value))}
                    min="1"
                    max="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Максимум хранилища (ГБ)
                  </label>
                  <Input
                    type="number"
                    value={settings.limits.maxStorage}
                    onChange={(e) => updateSetting('limits', 'maxStorage', parseInt(e.target.value))}
                    min="1"
                    max="10000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Максимальный размер файла (МБ)
                  </label>
                  <Input
                    type="number"
                    value={settings.limits.maxFileSize}
                    onChange={(e) => updateSetting('limits', 'maxFileSize', parseInt(e.target.value))}
                    min="1"
                    max="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Максимум чатов
                  </label>
                  <Input
                    type="number"
                    value={settings.limits.maxChats}
                    onChange={(e) => updateSetting('limits', 'maxChats', parseInt(e.target.value))}
                    min="1"
                    max="10000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Integrations Settings */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Интеграции
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Провайдер email
                </label>
                <select
                  value={settings.integrations.emailProvider}
                  onChange={(e) => updateSetting('integrations', 'emailProvider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="smtp">SMTP</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="mailgun">Mailgun</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP хост
                  </label>
                  <Input
                    value={settings.integrations.smtpHost}
                    onChange={(e) => updateSetting('integrations', 'smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP порт
                  </label>
                  <Input
                    type="number"
                    value={settings.integrations.smtpPort}
                    onChange={(e) => updateSetting('integrations', 'smtpPort', parseInt(e.target.value))}
                    placeholder="587"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP пользователь
                  </label>
                  <Input
                    value={settings.integrations.smtpUser}
                    onChange={(e) => updateSetting('integrations', 'smtpUser', e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP пароль
                  </label>
                  <Input
                    type="password"
                    value={settings.integrations.smtpPassword}
                    onChange={(e) => updateSetting('integrations', 'smtpPassword', e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-6">
        <Button
          variant="secondary"
          onClick={handleReset}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Сбросить
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Сохранить настройки
        </Button>
      </div>
    </div>
  );
}