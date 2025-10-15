'use client';

import { useState } from 'react';
import { useACL } from '@/lib/acl/context';
import { canEditUsers } from '@/lib/acl/role-guards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { 
  X, 
  Edit, 
  Save, 
  AlertTriangle, 
  User, 
  Lock, 
  Mail, 
  Calendar,
  Shield,
  Activity,
  Globe,
  AlertCircle,
  CheckCircle,
  Clock
} from '@/components/icons';

interface User {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin: string;
  parentAdminId?: string;
  parentAdmin?: {
    id: string;
    email: string;
  };
  children?: User[];
  permissions: string[];
  metadata: {
    loginCount: number;
    lastActivity: string;
    ipAddress: string;
    userAgent: string;
  };
}

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
}

export function UserDetailModal({ user, isOpen, onClose, onSave }: UserDetailModalProps) {
  const { ctx } = useACL();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  // Если user === null, значит создаем нового пользователя
  if (!user) {
    setIsCreating(true);
    setIsEditing(true);
  }

  const handleEdit = () => {
    setEditedUser({ ...user });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedUser) {
      onSave(editedUser);
      setIsEditing(false);
      setEditedUser(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser(null);
  };

  const handleStatusChange = (newStatus: 'active' | 'inactive' | 'suspended') => {
    if (editedUser) {
      setEditedUser({ ...editedUser, status: newStatus });
    }
  };

  const handleRoleChange = (newRole: 'SUPER_ADMIN' | 'ADMIN' | 'USER') => {
    if (editedUser) {
      setEditedUser({ ...editedUser, role: newRole });
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
      case 'inactive': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'suspended': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const currentUser = editedUser || user;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Редактирование пользователя' : 'Детали пользователя'}
              </h2>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button variant="secondary" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Редактировать
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={handleCancel}>
                  Отмена
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Основная информация</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  {isEditing ? (
                    <Input
                      value={currentUser.email}
                      onChange={(e) => setEditedUser({ ...currentUser, email: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{user.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID пользователя
                  </label>
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900 font-mono">{user.id}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Роль
                  </label>
                  {isEditing && canEditUsers(ctx.role) ? (
                    <select
                      value={currentUser.role}
                      onChange={(e) => handleRoleChange(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USER">Пользователь</option>
                      <option value="ADMIN">Администратор</option>
                      <option value="SUPER_ADMIN">Супер-администратор</option>
                    </select>
                  ) : (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.role)}`}>
                      {user.role}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Статус
                  </label>
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <Button
                        variant={currentUser.status === 'active' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleStatusChange('active')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Активный
                      </Button>
                      <Button
                        variant={currentUser.status === 'inactive' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleStatusChange('inactive')}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Неактивный
                      </Button>
                      <Button
                        variant={currentUser.status === 'suspended' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleStatusChange('suspended')}
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Заблокирован
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(user.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата создания
                  </label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Последний вход
                  </label>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {new Date(user.lastLogin).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Активность</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {user.metadata.loginCount}
                  </div>
                  <div className="text-sm text-gray-600">Всего входов</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {user.metadata.ipAddress}
                  </div>
                  <div className="text-sm text-gray-600">IP адрес</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {user.metadata.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}
                  </div>
                  <div className="text-sm text-gray-600">Тип устройства</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Agent
                </label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <code className="text-xs text-gray-600 break-all">
                    {user.metadata.userAgent}
                  </code>
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {user.permissions.map((permission, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {permission}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hierarchy */}
          {user.parentAdmin && (
            <Card>
              <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Иерархия</span>
              </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Родительский админ:</span>
                    <span className="text-sm text-gray-900">{user.parentAdmin.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
