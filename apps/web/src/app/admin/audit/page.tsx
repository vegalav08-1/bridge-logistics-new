'use client';

import { useState, useEffect } from 'react';
import { useACL } from '@/lib/acl/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Shield, 
  User, 
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  Eye,
  FileText,
  HardDrive,
  BarChart,
  TrendingUp,
  TrendingDown
} from '@/components/icons';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'error' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'login_failed' | 'suspicious_activity' | 'data_breach' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  ipAddress: string;
  resolved: boolean;
}

const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    timestamp: '2024-01-20T14:30:00Z',
    userId: 'user-123',
    userEmail: 'admin@example.com',
    action: 'user:edit',
    resource: 'user',
    resourceId: 'user-456',
    details: 'Изменен статус пользователя с "active" на "suspended"',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'success',
    severity: 'medium'
  },
  {
    id: 'audit-2',
    timestamp: '2024-01-20T14:25:00Z',
    userId: 'user-123',
    userEmail: 'admin@example.com',
    action: 'shipment:delete',
    resource: 'shipment',
    resourceId: 'ship-789',
    details: 'Удалена отгрузка BR-000123 по причине: damaged_goods',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'success',
    severity: 'high'
  },
  {
    id: 'audit-3',
    timestamp: '2024-01-20T14:20:00Z',
    userId: 'user-456',
    userEmail: 'user@example.com',
    action: 'login',
    resource: 'auth',
    resourceId: 'session-abc',
    details: 'Успешный вход в систему',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    status: 'success',
    severity: 'low'
  },
  {
    id: 'audit-4',
    timestamp: '2024-01-20T14:15:00Z',
    userId: 'user-789',
    userEmail: 'hacker@evil.com',
    action: 'login',
    resource: 'auth',
    resourceId: 'session-xyz',
    details: 'Неудачная попытка входа - неверный пароль',
    ipAddress: '192.168.1.200',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    status: 'error',
    severity: 'medium'
  }
];

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: 'security-1',
    timestamp: '2024-01-20T14:15:00Z',
    type: 'login_failed',
    severity: 'medium',
    description: 'Множественные неудачные попытки входа с IP 192.168.1.200',
    ipAddress: '192.168.1.200',
    resolved: false
  },
  {
    id: 'security-2',
    timestamp: '2024-01-20T13:45:00Z',
    type: 'suspicious_activity',
    severity: 'high',
    description: 'Подозрительная активность: попытка доступа к админ-панели с пользовательской роли',
    userId: 'user-456',
    ipAddress: '192.168.1.101',
    resolved: true
  },
  {
    id: 'security-3',
    timestamp: '2024-01-20T13:30:00Z',
    type: 'unauthorized_access',
    severity: 'critical',
    description: 'Попытка несанкционированного доступа к файлам системы',
    ipAddress: '192.168.1.150',
    resolved: false
  }
];

export default function AuditPage() {
  const { ctx } = useACL();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(mockSecurityEvents);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState('today');
  const [activeTab, setActiveTab] = useState('audit');

  // Проверяем права доступа
  if (ctx.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Доступ запрещен
            </h2>
            <p className="text-gray-600">
              У вас нет прав для просмотра аудита.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Фильтрация логов
  useEffect(() => {
    let filtered = auditLogs;

    // Поиск
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    // Фильтр по серьезности
    if (severityFilter !== 'all') {
      filtered = filtered.filter(log => log.severity === severityFilter);
    }

    setFilteredLogs(filtered);
  }, [auditLogs, searchTerm, statusFilter, severityFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <X className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSecurityTypeColor = (type: string) => {
    switch (type) {
      case 'login_failed': return 'bg-red-100 text-red-800';
      case 'suspicious_activity': return 'bg-orange-100 text-orange-800';
      case 'data_breach': return 'bg-red-100 text-red-800';
      case 'unauthorized_access': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExport = () => {
    console.log('Exporting audit logs...');
    // Здесь будет логика экспорта
  };

  const handleResolveSecurityEvent = (eventId: string) => {
    setSecurityEvents(securityEvents.map(event =>
      event.id === eventId ? { ...event, resolved: true } : event
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Аудит и мониторинг
              </h1>
              <p className="text-gray-600 mt-1">
                Логи действий, безопасность и мониторинг системы
              </p>
            </div>
            <Button onClick={handleExport} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Экспорт</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Всего событий</p>
                  <p className="text-2xl font-bold text-gray-900">1,234</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Успешных</p>
                  <p className="text-2xl font-bold text-gray-900">1,156</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ошибок</p>
                  <p className="text-2xl font-bold text-gray-900">78</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Shield className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Угроз</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('audit')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'audit'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Аудит лог
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Безопасность
              </button>
            </nav>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Поиск
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Поиск по действиям..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Все статусы</option>
                  <option value="success">Успешно</option>
                  <option value="error">Ошибка</option>
                  <option value="warning">Предупреждение</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Серьезность
                </label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Все уровни</option>
                  <option value="low">Низкая</option>
                  <option value="medium">Средняя</option>
                  <option value="high">Высокая</option>
                  <option value="critical">Критическая</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Период
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="today">Сегодня</option>
                  <option value="week">Неделя</option>
                  <option value="month">Месяц</option>
                  <option value="year">Год</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs */}
        {activeTab === 'audit' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Аудит лог ({filteredLogs.length})
                </CardTitle>
                <div className="text-sm text-gray-500">
                  Показано {filteredLogs.length} из {auditLogs.length} записей
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Время
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Пользователь
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действие
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Серьезность
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Детали
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.timestamp).toLocaleString('ru-RU')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {log.userEmail}
                            </div>
                            <div className="text-sm text-gray-500">
                              {log.ipAddress}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.action}</div>
                          <div className="text-sm text-gray-500">{log.resource}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(log.status)}
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                              {log.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(log.severity)}`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Events */}
        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle>
                События безопасности ({securityEvents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4 p-6">
                {securityEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border ${
                      event.resolved ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          event.severity === 'critical' ? 'bg-red-100' :
                          event.severity === 'high' ? 'bg-orange-100' :
                          event.severity === 'medium' ? 'bg-yellow-100' :
                          'bg-blue-100'
                        }`}>
                          <Shield className={`h-5 w-5 ${
                            event.severity === 'critical' ? 'text-red-600' :
                            event.severity === 'high' ? 'text-orange-600' :
                            event.severity === 'medium' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSecurityTypeColor(event.type)}`}>
                              {event.type}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(event.severity)}`}>
                              {event.severity}
                            </span>
                            {event.resolved && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Решено
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(event.timestamp).toLocaleString('ru-RU')} • {event.ipAddress}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!event.resolved && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleResolveSecurityEvent(event.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Решить
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
