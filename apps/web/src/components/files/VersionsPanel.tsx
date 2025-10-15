'use client';

import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  PlusIcon, 
  ArrowDownTrayIcon,
  ClockIcon,
  UserIcon,
  DocumentIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { FLAGS } from '@yp/shared';

interface AttachmentVersion {
  id: string;
  fileName: string;
  mime: string;
  bytes: number;
  sha256?: string;
  createdById: string;
  createdAt: string;
  note?: string;
}

interface Attachment {
  id: string;
  fileName: string;
  type: string;
  mime: string;
  bytes: number;
  width?: number;
  height?: number;
  pages?: number;
  thumbKey?: string;
  ocrTextKey?: string;
  isSafe: boolean;
  currentVerId?: string;
  uploadedAt: string;
  versions?: AttachmentVersion[];
  annotations?: any[];
  meta?: {
    ocrDone: boolean;
    ocrLang?: string;
  };
}

interface VersionsPanelProps {
  attachment: Attachment;
  isOpen: boolean;
  onClose: () => void;
}

export const VersionsPanel: React.FC<VersionsPanelProps> = ({
  attachment,
  isOpen,
  onClose
}) => {
  const [versions, setVersions] = useState<AttachmentVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVersion, setNewVersion] = useState({
    file: null as File | null,
    note: ''
  });

  useEffect(() => {
    if (isOpen && attachment) {
      loadVersions();
    }
  }, [isOpen, attachment]);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/attachments/${attachment.id}/versions`);
      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions || []);
      } else {
        // Fallback to demo data
        setVersions(attachment.versions || []);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
      setVersions(attachment.versions || []);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVersion = async () => {
    if (!newVersion.file) return;

    try {
      const formData = new FormData();
      formData.append('file', newVersion.file);
      formData.append('note', newVersion.note);

      const response = await fetch(`/api/attachments/${attachment.id}/versions`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setVersions(prev => [...prev, data.version]);
        setNewVersion({ file: null, note: '' });
        setShowAddForm(false);
      } else {
        throw new Error('Failed to create version');
      }
    } catch (error) {
      console.error('Error creating version:', error);
      setError('Ошибка создания версии');
    }
  };

  const handleDownloadVersion = async (version: AttachmentVersion) => {
    try {
      const response = await fetch(`/api/attachments/${attachment.id}/versions/${version.id}/url`);
      if (response.ok) {
        const data = await response.json();
        
        // Скачиваем файл
        const fileResponse = await fetch(data.url);
        const blob = await fileResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = version.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Ошибка скачивания версии');
      }
    } catch (error) {
      console.error('Error downloading version:', error);
      alert('Ошибка скачивания версии');
    }
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (!confirm('Удалить эту версию?')) return;

    try {
      const response = await fetch(`/api/attachments/${attachment.id}/versions/${versionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setVersions(prev => prev.filter(v => v.id !== versionId));
      } else {
        throw new Error('Failed to delete version');
      }
    } catch (error) {
      console.error('Error deleting version:', error);
      setError('Ошибка удаления версии');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Версии файла
            </h2>
            <p className="text-sm text-gray-600">{attachment.fileName}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Новая версия</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600">
              <div className="text-lg mb-2">⚠️</div>
              <div>{error}</div>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-4">📄</div>
              <div>Версий пока нет</div>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Добавить первую версию
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current version */}
              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-800">Текущая версия</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <DocumentIcon className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">{attachment.fileName}</h3>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(attachment.bytes)} • {formatDate(attachment.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownloadVersion({
                        id: attachment.id,
                        fileName: attachment.fileName,
                        mime: attachment.mime,
                        bytes: attachment.bytes,
                        createdById: 'current',
                        createdAt: attachment.uploadedAt
                      })}
                      className="p-2 text-green-600 hover:text-green-700 transition-colors"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Other versions */}
              {versions.map((version, index) => (
                <div key={version.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <DocumentIcon className="h-8 w-8 text-gray-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">{version.fileName}</h3>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(version.bytes)} • {formatDate(version.createdAt)}
                        </p>
                        {version.note && (
                          <p className="text-sm text-gray-500 mt-1">{version.note}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownloadVersion(version)}
                        className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVersion(version.id)}
                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-60 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-semibold mb-4">Добавить новую версию</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Файл
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setNewVersion({
                      ...newVersion,
                      file: e.target.files?.[0] || null
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    accept="*/*"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Примечание (необязательно)
                  </label>
                  <textarea
                    value={newVersion.note}
                    onChange={(e) => setNewVersion({
                      ...newVersion,
                      note: e.target.value
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Описание изменений..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleAddVersion}
                  disabled={!newVersion.file}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Добавить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};