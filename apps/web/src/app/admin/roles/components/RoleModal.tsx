'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { 
  X, 
  Shield, 
  Users, 
  Settings, 
  Eye, 
  Save,
  AlertTriangle
} from '@/components/icons';
import { rolesApi, type Role, type Permission, type CreateRoleRequest, type UpdateRoleRequest } from '@/lib/admin/roles-api';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: Role) => void;
  role?: Role | null;
  isEditing?: boolean;
}

const colorOptions = [
  { value: '#dc2626', label: 'Красный', name: 'red' },
  { value: '#2563eb', label: 'Синий', name: 'blue' },
  { value: '#16a34a', label: 'Зеленый', name: 'green' },
  { value: '#7c3aed', label: 'Фиолетовый', name: 'purple' },
  { value: '#ea580c', label: 'Оранжевый', name: 'orange' },
  { value: '#0891b2', label: 'Голубой', name: 'cyan' },
  { value: '#be123c', label: 'Розовый', name: 'pink' },
  { value: '#65a30d', label: 'Лайм', name: 'lime' }
];

const iconOptions = [
  { value: 'Shield', label: 'Щит', icon: Shield },
  { value: 'Users', label: 'Пользователи', icon: Users },
  { value: 'Settings', label: 'Настройки', icon: Settings },
  { value: 'Eye', label: 'Глаз', icon: Eye }
];

export function RoleModal({ isOpen, onClose, onSave, role, isEditing = false }: RoleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    metadata: {
      color: '#2563eb',
      icon: 'Users',
      priority: 1
    }
  });
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsByCategory, setPermissionsByCategory] = useState<Record<string, Permission[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем разрешения при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      loadPermissions();
    }
  }, [isOpen]);

  // Заполняем форму данными роли при редактировании
  useEffect(() => {
    if (isOpen && role) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        metadata: {
          color: role.metadata?.color || '#2563eb',
          icon: role.metadata?.icon || 'Users',
          priority: role.metadata?.priority || 1
        }
      });
    } else if (isOpen && !role) {
      // Сброс формы для создания новой роли
      setFormData({
        name: '',
        description: '',
        permissions: [],
        metadata: {
          color: '#2563eb',
          icon: 'Users',
          priority: 1
        }
      });
    }
  }, [isOpen, role]);

  const loadPermissions = async () => {
    try {
      const permissionsData = await rolesApi.getPermissionsByCategory();
      setPermissionsByCategory(permissionsData);
      setPermissions(Object.values(permissionsData).flat());
    } catch (error) {
      console.error('Ошибка загрузки разрешений:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMetadataChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleSelectAllCategory = (category: string) => {
    const categoryPermissions = permissionsByCategory[category] || [];
    const categoryPermissionIds = categoryPermissions.map(p => p.id);
    
    setFormData(prev => ({
      ...prev,
      permissions: [
        ...prev.permissions.filter(p => !categoryPermissionIds.includes(p)),
        ...categoryPermissionIds
      ]
    }));
  };

  const handleDeselectAllCategory = (category: string) => {
    const categoryPermissions = permissionsByCategory[category] || [];
    const categoryPermissionIds = categoryPermissions.map(p => p.id);
    
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.filter(p => !categoryPermissionIds.includes(p))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing && role) {
        const updateData: UpdateRoleRequest = {
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
          metadata: formData.metadata
        };
        
        const updatedRole = await rolesApi.updateRole(role.id, updateData);
        onSave(updatedRole);
      } else {
        const createData: CreateRoleRequest = {
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
          metadata: formData.metadata
        };
        
        const newRole = await rolesApi.createRole(createData);
        onSave(newRole);
      }
      
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка сохранения роли');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Редактировать роль' : 'Создать новую роль'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название роли *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Например: MANAGER"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Приоритет
              </label>
              <Input
                type="number"
                value={formData.metadata.priority}
                onChange={(e) => handleMetadataChange('priority', parseInt(e.target.value))}
                min="1"
                max="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Описание роли и её назначения"
              rows={3}
              required
            />
          </div>

          {/* Внешний вид */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цвет
              </label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleMetadataChange('color', color.value)}
                    className={`w-8 h-8 rounded-lg border-2 ${
                      formData.metadata.color === color.value
                        ? 'border-gray-900'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Иконка
              </label>
              <div className="grid grid-cols-4 gap-2">
                {iconOptions.map((iconOption) => {
                  const IconComponent = iconOption.icon;
                  return (
                    <button
                      key={iconOption.value}
                      type="button"
                      onClick={() => handleMetadataChange('icon', iconOption.value)}
                      className={`p-2 rounded-lg border-2 ${
                        formData.metadata.icon === iconOption.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      title={iconOption.label}
                    >
                      <IconComponent className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Разрешения */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Разрешения</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, permissions: permissions.map(p => p.id) }))}
                >
                  Выбрать все
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, permissions: [] }))}
                >
                  Очистить все
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{category}</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSelectAllCategory(category)}
                        >
                          Выбрать все
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeselectAllCategory(category)}
                        >
                          Очистить
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryPermissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{permission.name}</div>
                            <div className="text-xs text-gray-500">{permission.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name || !formData.description}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Сохранение...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {isEditing ? 'Сохранить изменения' : 'Создать роль'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
