'use client';

import { useState, useEffect } from 'react';
import { useACL } from '@/lib/acl/context';
import { canManageRoles } from '@/lib/acl/role-guards';
import { BackButton } from '@/components/layout/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RoleModal } from './components/RoleModal';
import { rolesApi, type Role } from '@/lib/admin/roles-api';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Lock,
  CheckCircle,
  X,
  AlertTriangle,
  Settings,
  Search,
  Filter,
  BarChart,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload
} from '@/components/icons';

export default function RolesPage() {
  const { ctx } = useACL();
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'system' | 'custom' | 'active' | 'inactive'>('all');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    system: 0,
    custom: 0,
    active: 0,
    inactive: 0
  });

  // Проверяем права доступа
  if (!canManageRoles(ctx.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Доступ запрещен
            </h2>
            <p className="text-gray-600">
              У вас нет прав для просмотра ролей.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    loadRoles();
    loadStats();
  }, []);

  // Фильтрация ролей
  useEffect(() => {
    let filtered = roles;

    // Фильтр по типу
    if (filterType === 'system') {
      filtered = filtered.filter(role => role.isSystem);
    } else if (filterType === 'custom') {
      filtered = filtered.filter(role => !role.isSystem);
    } else if (filterType === 'active') {
      filtered = filtered.filter(role => role.isActive);
    } else if (filterType === 'inactive') {
      filtered = filtered.filter(role => !role.isActive);
    }

    // Поиск
    if (searchTerm) {
      filtered = filtered.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRoles(filtered);
  }, [roles, searchTerm, filterType]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const rolesData = await rolesApi.getRoles();
      setRoles(rolesData);
    } catch (error) {
      setError('Ошибка загрузки ролей');
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await rolesApi.getRolesStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setShowCreateModal(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.id === 'super_admin') {
      setError('Роль SUPER_ADMIN нельзя удалять');
      return;
    }

    if (role.userCount > 0) {
      setError('Нельзя удалить роль, которая используется пользователями');
      return;
    }

    if (confirm(`Удалить роль "${role.name}"?`)) {
      try {
        setLoading(true);
        await rolesApi.deleteRole(role.id);
        await loadRoles();
        await loadStats();
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Ошибка удаления роли');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleRoleStatus = async (role: Role) => {
    if (role.id === 'super_admin') {
      setError('Роль SUPER_ADMIN нельзя деактивировать');
      return;
    }

    try {
      setLoading(true);
      await rolesApi.updateRole(role.id, { isActive: !role.isActive });
      await loadRoles();
      await loadStats();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка изменения статуса роли');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSaved = async () => {
    await loadRoles();
    await loadStats();
    setShowCreateModal(false);
    setShowEditModal(false);
  };

  const handleExportRoles = () => {
    const dataStr = JSON.stringify(roles, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `roles_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleCopyRole = (role: Role) => {
    const newRole = {
      ...role,
      name: `${role.name}_COPY`,
      description: `${role.description} (копия)`,
      userCount: 0,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setSelectedRole(newRole);
    setShowCreateModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <BackButton />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Управление ролями
                </h1>
                <p className="text-gray-600 mt-1">
                  Создание и настройка ролей пользователей
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleExportRoles}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Экспорт
              </Button>
              <Button
                onClick={handleCreateRole}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Создать роль
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Всего ролей</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                  <p className="text-sm font-medium text-gray-600">Системные</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.system}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Пользовательские</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.custom}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Активные</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <EyeOff className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Неактивные</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Поиск ролей..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Все роли</option>
                  <option value="system">Системные</option>
                  <option value="custom">Пользовательские</option>
                  <option value="active">Активные</option>
                  <option value="inactive">Неактивные</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-red-100 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Roles List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <Card key={role.id} className={`${!role.isActive ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: role.metadata?.color + '20' }}
                    >
                      <Shield 
                        className="h-5 w-5" 
                        style={{ color: role.metadata?.color }}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {role.id === 'super_admin' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Lock className="h-3 w-3 mr-1" />
                            Системная
                          </span>
                        )}
                        {!role.isActive && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Неактивная
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyRole(role)}
                      title="Копировать роль"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {role.id !== 'super_admin' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                        title="Редактировать"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {role.id !== 'super_admin' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRole(role)}
                        title="Удалить"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Пользователей:</span>
                    <span className="font-medium">{role.userCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Разрешений:</span>
                    <span className="font-medium">{role.permissions.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Создана:</span>
                    <span className="font-medium">
                      {new Date(role.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleToggleRoleStatus(role)}
                      disabled={role.id === 'super_admin'}
                    >
                      {role.isActive ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Деактивировать
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Активировать
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditRole(role)}
                    >
                      Подробнее
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRoles.length === 0 && (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Роли не найдены
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterType !== 'all' 
                ? 'Попробуйте изменить фильтры поиска'
                : 'Создайте первую роль для начала работы'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <Button onClick={handleCreateRole}>
                <Plus className="h-4 w-4 mr-2" />
                Создать роль
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <RoleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleRoleSaved}
        role={selectedRole}
        isEditing={false}
      />

      <RoleModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleRoleSaved}
        role={selectedRole}
        isEditing={true}
      />
    </div>
  );
}