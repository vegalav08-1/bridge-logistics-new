'use client';

import { useState, useEffect } from 'react';
import { useACL } from '@/lib/acl/context';
import { canManageUsers, canEditUsers, canDeleteUsers, canCreateUsers } from '@/lib/acl/role-guards';
import { BackButton } from '@/components/layout/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UserDetailModal } from './components/UserDetailModal';
import { CreateUserModal } from './components/CreateUserModal';
import { usersApi, type User } from '@/lib/admin/users-api';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  User as UserIcon,
  X,
  Mail,
  Calendar,
  MoreVertical,
  Eye,
  Lock,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Upload
} from '@/components/icons';

export default function UsersPage() {
  const { ctx } = useACL();

  const mockStats = {
    total: 5,
    active: 3,
    inactive: 1,
    suspended: 1,
    byRole: { SUPER_ADMIN: 1, ADMIN: 1, USER: 3 }
  };

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState(mockStats);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Проверяем права доступа
  if (!canManageUsers(ctx.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Доступ запрещен
            </h2>
            <p className="text-gray-600">
              У вас нет прав для управления пользователями.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock данные уже загружены в состоянии

  // Фильтрация пользователей
  useEffect(() => {
    let filtered = users;

    // Поиск по email
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фильтр по роли
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Закрытие выпадающего меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showExportMenu]);

  // Функции для работы с API
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await usersApi.getUsers();
      setUsers(usersData);
    } catch (err) {
      setError('Ошибка загрузки пользователей');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await usersApi.getUserStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-800';
      case 'ADMIN': return 'bg-blue-100 text-blue-800';
      case 'USER': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactive': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'suspended': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleUserAction = async (action: string, user: User) => {
    try {
      switch (action) {
        case 'edit':
          setSelectedUser(user);
          setShowUserModal(true);
          break;
        case 'delete':
          if (confirm(`Вы уверены, что хотите удалить пользователя ${user.email}?`)) {
            await usersApi.deleteUser(user.id);
            await loadUsers();
            await loadStats();
          }
          break;
        case 'activate':
          await usersApi.changeUserStatus(user.id, 'active');
          await loadUsers();
          await loadStats();
          break;
        case 'deactivate':
          await usersApi.changeUserStatus(user.id, 'inactive');
          await loadUsers();
          await loadStats();
          break;
        case 'suspend':
          await usersApi.changeUserStatus(user.id, 'suspended');
          await loadUsers();
          await loadStats();
          break;
        case 'resetPassword':
          await usersApi.resetUserPassword(user.id);
          alert('Пароль сброшен. Новый пароль отправлен на email пользователя.');
          break;
        default:
          console.log(`${action} user:`, user);
      }
    } catch (err) {
      setError(`Ошибка выполнения действия: ${err}`);
      console.error('Error performing action:', err);
    }
  };

  const handleSaveUser = async (updatedUser: User) => {
    try {
      await usersApi.updateUser(updatedUser.id, updatedUser);
      await loadUsers();
      await loadStats();
      setShowUserModal(false);
      setSelectedUser(null);
    } catch (err) {
      setError(`Ошибка сохранения пользователя: ${err}`);
      console.error('Error saving user:', err);
    }
  };

  const handleCreateUser = () => {
    setShowCreateModal(true);
  };

  const handleCreateUserSubmit = async (userData: any) => {
    try {
      await usersApi.createUser(userData);
      await loadUsers();
      await loadStats();
      setShowCreateModal(false);
      console.log('Пользователь успешно создан');
    } catch (err) {
      setError(`Ошибка создания пользователя: ${err}`);
      console.error('Error creating user:', err);
    }
  };

  const handleExportCSV = async () => {
    try {
      setLoading(true);
      const csvContent = await usersApi.exportUsersToCSV();
      
      // Создаем и скачиваем файл
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Экспорт в CSV завершен');
    } catch (err) {
      setError('Ошибка при экспорте данных');
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const excelData = await usersApi.exportUsersToExcel();
      
      // Создаем JSON файл (в реальном приложении можно использовать библиотеку для Excel)
      const jsonContent = JSON.stringify(excelData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Экспорт в Excel (JSON) завершен');
    } catch (err) {
      setError('Ошибка при экспорте данных');
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await Promise.all([loadUsers(), loadStats()]);
      // Показываем уведомление об успешном обновлении
      console.log('Данные пользователей обновлены');
    } catch (err) {
      setError('Ошибка при обновлении данных');
    } finally {
      setLoading(false);
    }
  };

  // Инициализация данных при загрузке страницы
  useEffect(() => {
    // Инициализируем данные из localStorage
    usersApi.initializeData();
    loadUsers();
    loadStats();
  }, []);

  // Убираем условие загрузки, так как используем mock данные

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Ошибка загрузки
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Попробовать снова
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Кнопка назад */}
          <div className="mb-4">
            <BackButton />
          </div>
          
          {/* Заголовок по центру */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Управление пользователями
            </h1>
          </div>
          
          {/* Кнопки под заголовком */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Button 
              variant="secondary" 
              onClick={handleRefresh} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Обновление...' : 'Обновить'}
            </Button>
            <div className="relative w-full sm:w-auto">
              <Button 
                variant="secondary" 
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </Button>
              
              {showExportMenu && (
                <div className="absolute top-full left-0 mt-2 w-full sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        handleExportCSV();
                        setShowExportMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Экспорт в CSV
                    </button>
                    <button
                      onClick={() => {
                        handleExportExcel();
                        setShowExportMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Экспорт в Excel
                    </button>
                  </div>
                </div>
              )}
            </div>
            <Button onClick={handleCreateUser} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Добавить пользователя
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.total}</p>
                <p className="text-sm font-medium text-gray-600">Всего</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.active}</p>
                <p className="text-sm font-medium text-gray-600">Активные</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.inactive}</p>
                <p className="text-sm font-medium text-gray-600">Неактивные</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.suspended}</p>
                <p className="text-sm font-medium text-gray-600">Заблокированные</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Фильтры и поиск</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 text-center">
                  Поиск по email
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Введите email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 text-center"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 text-center">
                  Роль пользователя
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-center"
                >
                  <option value="all">Все роли</option>
                  <option value="SUPER_ADMIN">Супер-админ</option>
                  <option value="ADMIN">Администратор</option>
                  <option value="USER">Пользователь</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 text-center">
                  Статус аккаунта
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-center"
                >
                  <option value="all">Все статусы</option>
                  <option value="active">Активные</option>
                  <option value="inactive">Неактивные</option>
                  <option value="suspended">Заблокированные</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 text-center">
                  Дополнительно
                </label>
                <Button variant="secondary" className="w-full h-11">
                  <Filter className="h-4 w-4 mr-2" />
                  Расширенные фильтры
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="mt-6 sm:mt-8">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                <div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
                    Список пользователей
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Найдено: {filteredUsers.length} из {stats.total} пользователей
                  </p>
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Всего: {stats.total}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Пользователи не найдены</h3>
                  <p className="text-sm text-gray-500">Попробуйте изменить фильтры поиска</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider">
                          Пользователь
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider">
                          Роль
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider">
                          Статус
                        </th>
                        <th className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider">
                          Последний вход
                        </th>
                        <th className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider">
                          Активность
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                                </div>
                              </div>
                              <div className="ml-2 sm:ml-4">
                                <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[150px] sm:max-w-none">
                                  {user.email}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {user.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(user.status)}
                              <span className={`ml-1 sm:ml-2 inline-flex px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                                {user.status === 'active' ? 'Активный' : user.status === 'inactive' ? 'Неактивный' : 'Заблокирован'}
                              </span>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                            {new Date(user.lastLogin).toLocaleDateString('ru-RU')}
                          </td>
                          <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {user.metadata.loginCount} входов
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                            <div className="flex items-center justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserModal(true);
                                }}
                                title="Просмотр"
                                className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-blue-50"
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUserAction('edit', user)}
                                title="Редактировать"
                                className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-green-50"
                              >
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                              </Button>
                              {user.status === 'active' ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUserAction('deactivate', user)}
                                  title="Деактивировать"
                                  className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-yellow-50"
                                >
                                  <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUserAction('activate', user)}
                                  title="Активировать"
                                  className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUserAction('resetPassword', user)}
                                title="Сбросить пароль"
                                className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-purple-50"
                              >
                                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUserAction('delete', user)}
                                title="Удалить"
                                className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
      />

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateUserSubmit}
      />
    </div>
  );
}