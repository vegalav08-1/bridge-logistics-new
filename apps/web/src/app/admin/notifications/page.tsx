'use client';

import { useState } from 'react';
import { useACL } from '@/lib/acl/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  Bell,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Settings,
  Send,
  Save,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  EyeOff
} from '@/components/icons';

export default function NotificationsPage() {
  const { ctx } = useACL();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      enabled: true,
      smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        user: '',
        password: ''
      }
    },
    push: {
      enabled: true,
      apiKey: '',
      projectId: ''
    },
    sms: {
      enabled: false,
      provider: 'twilio',
      apiKey: '',
      apiSecret: ''
    }
  });

  const [templates] = useState([
    {
      id: 1,
      name: 'Новое сообщение в чате',
      type: 'chat_message',
      subject: 'Новое сообщение в чате #{chatId}',
      body: 'Пользователь {userName} отправил новое сообщение в чате {chatId}.',
      channels: ['email', 'push'],
      active: true
    },
    {
      id: 2,
      name: 'Изменение статуса отгрузки',
      type: 'shipment_status',
      subject: 'Статус отгрузки изменен',
      body: 'Статус отгрузки {shipmentId} изменен на {newStatus}.',
      channels: ['email', 'push'],
      active: true
    },
    {
      id: 3,
      name: 'Новый пользователь',
      type: 'user_registration',
      subject: 'Новый пользователь зарегистрирован',
      body: 'Пользователь {userName} ({userEmail}) зарегистрирован в системе.',
      channels: ['email'],
      active: true
    },
    {
      id: 4,
      name: 'Системное уведомление',
      type: 'system',
      subject: 'Системное уведомление',
      body: '{message}',
      channels: ['email', 'push', 'sms'],
      active: false
    }
  ]);

  const [notifications] = useState([
    {
      id: 1,
      type: 'chat_message',
      recipient: 'user@example.com',
      subject: 'Новое сообщение в чате #12345',
      status: 'sent',
      sentAt: '2024-01-15 14:30:00',
      channel: 'email'
    },
    {
      id: 2,
      type: 'shipment_status',
      recipient: 'admin@example.com',
      subject: 'Статус отгрузки изменен',
      status: 'delivered',
      sentAt: '2024-01-15 13:45:00',
      channel: 'push'
    },
    {
      id: 3,
      type: 'system',
      recipient: '+7 (999) 123-45-67',
      subject: 'Системное уведомление',
      status: 'failed',
      sentAt: '2024-01-15 12:20:00',
      channel: 'sms'
    }
  ]);

  const handleSendTest = async () => {
    setIsLoading(true);
    // Simulate sending test notification
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    alert('Тестовое уведомление отправлено');
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    // Simulate saving settings
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    alert('Настройки сохранены');
  };

  const handleDeleteNotification = async (id: number) => {
    if (confirm('Удалить это уведомление?')) {
      setIsLoading(true);
      // Simulate delete
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
      alert('Уведомление удалено');
    }
  };

  const handleToggleTemplate = async (id: number) => {
    setIsLoading(true);
    // Simulate toggle
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
    alert('Шаблон обновлен');
  };

  if (ctx.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Доступ запрещен</h2>
          <p className="text-gray-600">У вас нет прав для доступа к управлению уведомлениями</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Уведомления</h1>
        <p className="text-gray-600">Управление системными уведомлениями и шаблонами</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'templates', label: 'Шаблоны', icon: MessageSquare },
              { id: 'settings', label: 'Настройки', icon: Settings },
              { id: 'history', label: 'История', icon: Clock }
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

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Шаблоны уведомлений</h2>
            <Button
              onClick={handleSendTest}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Отправить тест
            </Button>
          </div>

          <div className="space-y-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-900">{template.name}</h3>
                        <div className="ml-2 flex items-center">
                          {template.active ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{template.subject}</p>
                      <p className="text-xs text-gray-600 mb-2">{template.body}</p>
                      <div className="flex items-center space-x-2">
                        {template.channels.map((channel) => (
                          <span
                            key={channel}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {channel === 'email' ? 'Email' : 
                             channel === 'push' ? 'Push' : 
                             channel === 'sms' ? 'SMS' : channel}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleToggleTemplate(template.id)}
                        disabled={isLoading}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Редактировать
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleToggleTemplate(template.id)}
                        disabled={isLoading}
                      >
                        {template.active ? (
                          <EyeOff className="h-4 w-4 mr-1" />
                        ) : (
                          <Eye className="h-4 w-4 mr-1" />
                        )}
                        {template.active ? 'Отключить' : 'Включить'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Настройки email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailEnabled"
                  checked={notificationSettings.email.enabled}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    email: { ...prev.email, enabled: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="emailEnabled" className="ml-2 text-sm text-gray-700">
                  Включить email уведомления
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP хост
                  </label>
                  <Input
                    value={notificationSettings.email.smtp.host}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      email: {
                        ...prev.email,
                        smtp: { ...prev.email.smtp, host: e.target.value }
                      }
                    }))}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP порт
                  </label>
                  <Input
                    type="number"
                    value={notificationSettings.email.smtp.port}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      email: {
                        ...prev.email,
                        smtp: { ...prev.email.smtp, port: parseInt(e.target.value) }
                      }
                    }))}
                    placeholder="587"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Пользователь
                  </label>
                  <Input
                    value={notificationSettings.email.smtp.user}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      email: {
                        ...prev.email,
                        smtp: { ...prev.email.smtp, user: e.target.value }
                      }
                    }))}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Пароль
                  </label>
                  <Input
                    type="password"
                    value={notificationSettings.email.smtp.password}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      email: {
                        ...prev.email,
                        smtp: { ...prev.email.smtp, password: e.target.value }
                      }
                    }))}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Настройки push уведомлений
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pushEnabled"
                  checked={notificationSettings.push.enabled}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    push: { ...prev.push, enabled: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="pushEnabled" className="ml-2 text-sm text-gray-700">
                  Включить push уведомления
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API ключ
                  </label>
                  <Input
                    value={notificationSettings.push.apiKey}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      push: { ...prev.push, apiKey: e.target.value }
                    }))}
                    placeholder="API ключ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID проекта
                  </label>
                  <Input
                    value={notificationSettings.push.projectId}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      push: { ...prev.push, projectId: e.target.value }
                    }))}
                    placeholder="ID проекта"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Настройки SMS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="smsEnabled"
                  checked={notificationSettings.sms.enabled}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    sms: { ...prev.sms, enabled: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="smsEnabled" className="ml-2 text-sm text-gray-700">
                  Включить SMS уведомления
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Провайдер
                  </label>
                  <select
                    value={notificationSettings.sms.provider}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      sms: { ...prev.sms, provider: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="twilio">Twilio</option>
                    <option value="smsru">SMS.ru</option>
                    <option value="smsc">SMSC.ru</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API ключ
                  </label>
                  <Input
                    value={notificationSettings.sms.apiKey}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      sms: { ...prev.sms, apiKey: e.target.value }
                    }))}
                    placeholder="API ключ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API секрет
                  </label>
                  <Input
                    type="password"
                    value={notificationSettings.sms.apiSecret}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      sms: { ...prev.sms, apiSecret: e.target.value }
                    }))}
                    placeholder="API секрет"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveSettings}
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
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">История уведомлений</h2>
            <Button
              variant="secondary"
              onClick={() => setActiveTab('templates')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Управление шаблонами
            </Button>
          </div>

          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                        {notification.channel === 'email' ? 'E' : 
                         notification.channel === 'push' ? 'P' : 'S'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{notification.subject}</p>
                        <p className="text-xs text-gray-500">
                          {notification.recipient} • {notification.sentAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {notification.status === 'sent' ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        ) : notification.status === 'delivered' ? (
                          <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className="text-sm text-gray-600 capitalize">{notification.status}</span>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDeleteNotification(notification.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

