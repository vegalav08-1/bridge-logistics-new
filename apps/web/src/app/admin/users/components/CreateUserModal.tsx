'use client';

import { useState } from 'react';
import { useACL } from '@/lib/acl/context';
import { canCreateUsers } from '@/lib/acl/role-guards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  X, 
  Save, 
  User, 
  Mail, 
  Shield,
  AlertTriangle,
  CheckCircle
} from '@/components/icons';

interface CreateUserRequest {
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  permissions: string[];
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (userData: CreateUserRequest) => void;
}

const availablePermissions = [
  'shipment:view',
  'shipment:create',
  'shipment:edit',
  'shipment:delete',
  'user:view',
  'user:create',
  'user:edit',
  'user:delete',
  'finance:view',
  'finance:edit',
  'request:view',
  'request:create',
  'request:edit',
  'request:delete',
  'admin:view',
  'admin:manage'
];

export function CreateUserModal({ isOpen, onClose, onCreate }: CreateUserModalProps) {
  const { ctx } = useACL();
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    role: 'USER',
    permissions: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'Необходимо выбрать хотя бы одно разрешение';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onCreate(formData);
      handleClose();
    } catch (err) {
      console.error('Error creating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      role: 'USER',
      permissions: []
    });
    setErrors({});
    onClose();
  };

  const handlePermissionToggle = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleRoleChange = (role: 'ADMIN' | 'USER' | 'SUPER_ADMIN') => {
    setFormData(prev => ({
      ...prev,
      role,
      // Автоматически добавляем базовые разрешения для роли
      permissions: role === 'SUPER_ADMIN'
        ? ['*'] // Все разрешения для супер-администратора
        : role === 'ADMIN' 
        ? ['shipment:view', 'shipment:create', 'shipment:edit', 'user:view', 'admin:view']
        : ['shipment:view', 'request:create']
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Создание нового пользователя
              </h2>
              <p className="text-sm text-gray-600">Заполните данные для нового пользователя</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Основная информация</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email адрес *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Роль пользователя
                </label>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={formData.role === 'USER' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleRoleChange('USER')}
                  >
                    <User className="h-4 w-4 mr-1" />
                    Пользователь
                  </Button>
                  <Button
                    type="button"
                    variant={formData.role === 'ADMIN' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleRoleChange('ADMIN')}
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Администратор
                  </Button>
                  {canCreateUsers(ctx.role) && (
                    <Button
                      type="button"
                      variant={formData.role === 'SUPER_ADMIN' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handleRoleChange('SUPER_ADMIN')}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Супер-администратор
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.role === 'SUPER_ADMIN' 
                    ? 'Супер-администратор с полными правами доступа'
                    : formData.role === 'ADMIN' 
                    ? 'Администратор имеет расширенные права доступа'
                    : 'Обычный пользователь с базовыми правами'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Разрешения</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availablePermissions.map((permission) => (
                  <label
                    key={permission}
                    className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission)}
                      onChange={() => handlePermissionToggle(permission)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{permission}</span>
                  </label>
                ))}
              </div>
              {errors.permissions && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {errors.permissions}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Создание...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Создать пользователя
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
