'use client';

import { useState, useEffect } from 'react';
import { useACL } from '@/lib/acl/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  BarChart,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  FileText,
  Activity,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  AlertTriangle
} from '@/components/icons';

export default function AnalyticsPage() {
  const { ctx } = useACL();
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState({
    overview: {
      totalUsers: 156,
      activeUsers: 89,
      totalChats: 342,
      totalMessages: 2847,
      totalFiles: 156,
      storageUsed: 2.4
    },
    trends: {
      users: { current: 89, previous: 76, change: 17.1 },
      chats: { current: 342, previous: 298, change: 14.8 },
      messages: { current: 2847, previous: 2156, change: 32.0 },
      files: { current: 156, previous: 134, change: 16.4 }
    },
    charts: {
      userActivity: [
        { date: '2024-01-01', users: 45, chats: 23, messages: 156 },
        { date: '2024-01-02', users: 52, chats: 31, messages: 189 },
        { date: '2024-01-03', users: 48, chats: 28, messages: 167 },
        { date: '2024-01-04', users: 61, chats: 35, messages: 203 },
        { date: '2024-01-05', users: 55, chats: 32, messages: 178 },
        { date: '2024-01-06', users: 67, chats: 41, messages: 234 },
        { date: '2024-01-07', users: 73, chats: 45, messages: 267 }
      ],
      topUsers: [
        { name: 'Иван Петров', role: 'ADMIN', messages: 156, lastActive: '2 часа назад' },
        { name: 'Мария Сидорова', role: 'USER', messages: 134, lastActive: '1 час назад' },
        { name: 'Алексей Козлов', role: 'USER', messages: 98, lastActive: '3 часа назад' },
        { name: 'Елена Волкова', role: 'ADMIN', messages: 87, lastActive: '30 минут назад' },
        { name: 'Дмитрий Новиков', role: 'USER', messages: 76, lastActive: '5 часов назад' }
      ],
      systemHealth: {
        uptime: '99.9%',
        responseTime: '145ms',
        errorRate: '0.2%',
        cpuUsage: '23%',
        memoryUsage: '67%',
        diskUsage: '45%'
      }
    }
  });

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleExport = () => {
    alert('Экспорт данных в CSV');
  };

  if (ctx.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Доступ запрещен</h2>
          <p className="text-gray-600">У вас нет прав для доступа к аналитике</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Аналитика</h1>
            <p className="text-gray-600">Статистика использования системы</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Обновить
            </Button>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {[
            { value: '1d', label: '1 день' },
            { value: '7d', label: '7 дней' },
            { value: '30d', label: '30 дней' },
            { value: '90d', label: '90 дней' }
          ].map(({ value, label }) => (
            <Button
              key={value}
              variant={timeRange === value ? 'primary' : 'secondary'}
              onClick={() => setTimeRange(value)}
              className="text-sm"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Активных</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Чатов</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalChats}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Сообщений</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-indigo-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Файлов</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalFiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Хранилище (ГБ)</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.storageUsed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Тренды активности
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.trends).map(([key, data]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {key === 'users' ? 'Пользователи' : 
                       key === 'chats' ? 'Чаты' : 
                       key === 'messages' ? 'Сообщения' : 'Файлы'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">{data.current}</span>
                    <div className={`flex items-center ${
                      data.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {data.change > 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-sm font-medium">
                        {data.change > 0 ? '+' : ''}{data.change}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Топ пользователей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.charts.topUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.role} • {user.lastActive}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.messages}</p>
                    <p className="text-xs text-gray-500">сообщений</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Здоровье системы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Время работы</span>
                <span className="text-sm font-medium text-green-600">{analytics.charts.systemHealth.uptime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Время отклика</span>
                <span className="text-sm font-medium text-gray-900">{analytics.charts.systemHealth.responseTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Ошибки</span>
                <span className="text-sm font-medium text-red-600">{analytics.charts.systemHealth.errorRate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">CPU</span>
                <span className="text-sm font-medium text-gray-900">{analytics.charts.systemHealth.cpuUsage}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Память</span>
                <span className="text-sm font-medium text-gray-900">{analytics.charts.systemHealth.memoryUsage}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Диск</span>
                <span className="text-sm font-medium text-gray-900">{analytics.charts.systemHealth.diskUsage}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2" />
              Активность по дням
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.charts.userActivity.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(day.date).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <div className="flex space-x-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Пользователи</p>
                      <p className="text-sm font-medium text-gray-900">{day.users}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Чаты</p>
                      <p className="text-sm font-medium text-gray-900">{day.chats}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Сообщения</p>
                      <p className="text-sm font-medium text-gray-900">{day.messages}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

