'use client';

import { useState } from 'react';
import { useACL } from '@/lib/acl/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Server,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
  Database,
  FileText,
  Shield,
  Activity
} from '@/components/icons';

export default function DatabasePage() {
  const { ctx } = useACL();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [backupSettings, setBackupSettings] = useState({
    frequency: 'daily',
    retention: 30,
    compression: true,
    encryption: true,
    location: 'local'
  });

  const [databaseStats] = useState({
    size: '2.4 GB',
    tables: 15,
    records: 125847,
    lastBackup: '2024-01-15 14:30:00',
    nextBackup: '2024-01-16 02:00:00',
    health: 'excellent'
  });

  const [backups] = useState([
    {
      id: 1,
      name: 'backup_2024_01_15_143000.sql',
      size: '1.2 GB',
      date: '2024-01-15 14:30:00',
      status: 'completed',
      type: 'full'
    },
    {
      id: 2,
      name: 'backup_2024_01_14_143000.sql',
      size: '1.1 GB',
      date: '2024-01-14 14:30:00',
      status: 'completed',
      type: 'full'
    },
    {
      id: 3,
      name: 'backup_2024_01_13_143000.sql',
      size: '1.0 GB',
      date: '2024-01-13 14:30:00',
      status: 'completed',
      type: 'full'
    }
  ]);

  const handleBackup = async () => {
    setIsLoading(true);
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    alert('Резервная копия создана успешно');
  };

  const handleRestore = async (backupId: number) => {
    if (confirm('Вы уверены, что хотите восстановить базу данных из этой резервной копии? Это действие нельзя отменить.')) {
      setIsLoading(true);
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsLoading(false);
      alert('База данных восстановлена успешно');
    }
  };

  const handleDeleteBackup = async (backupId: number) => {
    if (confirm('Вы уверены, что хотите удалить эту резервную копию?')) {
      setIsLoading(true);
      // Simulate delete process
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
      alert('Резервная копия удалена');
    }
  };

  const handleOptimize = async () => {
    if (confirm('Выполнить оптимизацию базы данных? Это может занять некоторое время.')) {
      setIsLoading(true);
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 5000));
      setIsLoading(false);
      alert('База данных оптимизирована');
    }
  };

  if (ctx.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Доступ запрещен</h2>
          <p className="text-gray-600">У вас нет прав для доступа к управлению данными</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Управление данными</h1>
        <p className="text-gray-600">Резервное копирование и управление базой данных</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Обзор', icon: Activity },
              { id: 'backups', label: 'Резервные копии', icon: Database },
              { id: 'settings', label: 'Настройки', icon: Server }
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Database Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <HardDrive className="h-8 w-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Размер БД</p>
                    <p className="text-2xl font-bold text-gray-900">{databaseStats.size}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Database className="h-8 w-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Таблицы</p>
                    <p className="text-2xl font-bold text-gray-900">{databaseStats.tables}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Записей</p>
                    <p className="text-2xl font-bold text-gray-900">{databaseStats.records.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-red-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Здоровье</p>
                    <p className="text-2xl font-bold text-green-600 capitalize">{databaseStats.health}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Быстрые действия
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={handleBackup}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Создать резервную копию
                </Button>

                <Button
                  variant="secondary"
                  onClick={handleOptimize}
                  disabled={isLoading}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Оптимизировать БД
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => setActiveTab('settings')}
                  className="w-full"
                >
                  <Server className="h-4 w-4 mr-2" />
                  Настройки
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Last Backup Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Последняя резервная копия
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Дата создания</p>
                  <p className="text-lg font-semibold text-gray-900">{databaseStats.lastBackup}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Следующая копия</p>
                  <p className="text-lg font-semibold text-gray-900">{databaseStats.nextBackup}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backups Tab */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Резервные копии</h2>
            <Button
              onClick={handleBackup}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Создать копию
            </Button>
          </div>

          <div className="space-y-4">
            {backups.map((backup) => (
              <Card key={backup.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Database className="h-8 w-8 text-blue-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{backup.name}</p>
                        <p className="text-xs text-gray-500">
                          {backup.size} • {backup.date} • {backup.type === 'full' ? 'Полная' : 'Инкрементальная'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {backup.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                        )}
                        <span className="text-sm text-gray-600 capitalize">{backup.status}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRestore(backup.id)}
                          disabled={isLoading}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Восстановить
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDeleteBackup(backup.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Удалить
                        </Button>
                      </div>
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
                <Server className="h-5 w-5 mr-2" />
                Настройки резервного копирования
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Частота резервного копирования
                  </label>
                  <select
                    value={backupSettings.frequency}
                    onChange={(e) => setBackupSettings(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hourly">Каждый час</option>
                    <option value="daily">Ежедневно</option>
                    <option value="weekly">Еженедельно</option>
                    <option value="monthly">Ежемесячно</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Хранение копий (дни)
                  </label>
                  <Input
                    type="number"
                    value={backupSettings.retention}
                    onChange={(e) => setBackupSettings(prev => ({ ...prev, retention: parseInt(e.target.value) }))}
                    min="1"
                    max="365"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Место хранения
                  </label>
                  <select
                    value={backupSettings.location}
                    onChange={(e) => setBackupSettings(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="local">Локальное хранилище</option>
                    <option value="cloud">Облачное хранилище</option>
                    <option value="remote">Удаленный сервер</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="compression"
                      checked={backupSettings.compression}
                      onChange={(e) => setBackupSettings(prev => ({ ...prev, compression: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="compression" className="ml-2 text-sm text-gray-700">
                      Сжатие резервных копий
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="encryption"
                      checked={backupSettings.encryption}
                      onChange={(e) => setBackupSettings(prev => ({ ...prev, encryption: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="encryption" className="ml-2 text-sm text-gray-700">
                      Шифрование резервных копий
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={() => alert('Настройки сохранены')}
              disabled={isLoading}
            >
              <Server className="h-4 w-4 mr-2" />
              Сохранить настройки
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

