'use client';

import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { FLAGS } from '@yp/shared';

interface Annotation {
  id: string;
  authorId: string;
  page?: number;
  rect?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  content: string;
  createdAt: string;
  updatedAt?: string;
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
  versions?: any[];
  annotations?: Annotation[];
  meta?: {
    ocrDone: boolean;
    ocrLang?: string;
  };
}

interface AnnotationsPanelProps {
  attachment: Attachment;
  isOpen: boolean;
  onClose: () => void;
}

export const AnnotationsPanel: React.FC<AnnotationsPanelProps> = ({
  attachment,
  isOpen,
  onClose
}) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);
  const [newAnnotation, setNewAnnotation] = useState({
    content: '',
    page: 1,
    rect: { x: 0, y: 0, w: 100, h: 50 }
  });

  useEffect(() => {
    if (isOpen && attachment) {
      loadAnnotations();
    }
  }, [isOpen, attachment]);

  const loadAnnotations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/attachments/${attachment.id}/annotations`);
      if (response.ok) {
        const data = await response.json();
        setAnnotations(data.annotations || []);
      } else {
        // Fallback to demo data
        setAnnotations(attachment.annotations || []);
      }
    } catch (error) {
      console.error('Error loading annotations:', error);
      setAnnotations(attachment.annotations || []);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAnnotation = async () => {
    if (!newAnnotation.content.trim()) return;

    try {
      const response = await fetch(`/api/attachments/${attachment.id}/annotate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newAnnotation.content,
          page: newAnnotation.page,
          rect: newAnnotation.rect
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnnotations(prev => [...prev, data.annotation]);
        setNewAnnotation({ content: '', page: 1, rect: { x: 0, y: 0, w: 100, h: 50 } });
        setShowAddForm(false);
      } else {
        throw new Error('Failed to create annotation');
      }
    } catch (error) {
      console.error('Error creating annotation:', error);
      setError('Ошибка создания аннотации');
    }
  };

  const handleEditAnnotation = async (annotation: Annotation) => {
    try {
      const response = await fetch(`/api/attachments/${attachment.id}/annotations/${annotation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: annotation.content,
          page: annotation.page,
          rect: annotation.rect
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnnotations(prev => prev.map(a => a.id === annotation.id ? data.annotation : a));
        setEditingAnnotation(null);
      } else {
        throw new Error('Failed to update annotation');
      }
    } catch (error) {
      console.error('Error updating annotation:', error);
      setError('Ошибка обновления аннотации');
    }
  };

  const handleDeleteAnnotation = async (annotationId: string) => {
    if (!confirm('Удалить аннотацию?')) return;

    try {
      const response = await fetch(`/api/attachments/${attachment.id}/annotations/${annotationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAnnotations(prev => prev.filter(a => a.id !== annotationId));
      } else {
        throw new Error('Failed to delete annotation');
      }
    } catch (error) {
      console.error('Error deleting annotation:', error);
      setError('Ошибка удаления аннотации');
    }
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
              Аннотации к файлу
            </h2>
            <p className="text-sm text-gray-600">{attachment.fileName}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Добавить</span>
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
          ) : annotations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-4">📝</div>
              <div>Аннотаций пока нет</div>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Добавить первую аннотацию
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {annotations.map((annotation) => (
                <div key={annotation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Автор</span>
                        <ClockIcon className="h-4 w-4 text-gray-500 ml-4" />
                        <span className="text-sm text-gray-600">
                          {formatDate(annotation.createdAt)}
                        </span>
                      </div>
                      
                      {annotation.page && (
                        <div className="text-sm text-gray-600 mb-2">
                          Страница: {annotation.page}
                        </div>
                      )}
                      
                      {annotation.rect && (
                        <div className="text-sm text-gray-600 mb-2">
                          Позиция: x:{annotation.rect.x}, y:{annotation.rect.y}, 
                          w:{annotation.rect.w}, h:{annotation.rect.h}
                        </div>
                      )}
                      
                      <div className="text-gray-900">
                        {editingAnnotation?.id === annotation.id ? (
                          <textarea
                            value={editingAnnotation.content}
                            onChange={(e) => setEditingAnnotation({
                              ...editingAnnotation,
                              content: e.target.value
                            })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                          />
                        ) : (
                          <p>{annotation.content}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {editingAnnotation?.id === annotation.id ? (
                        <>
                          <button
                            onClick={() => handleEditAnnotation(editingAnnotation)}
                            className="p-1 text-green-600 hover:text-green-700 transition-colors"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditingAnnotation(null)}
                            className="p-1 text-gray-600 hover:text-gray-700 transition-colors"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingAnnotation(annotation)}
                            className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAnnotation(annotation.id)}
                            className="p-1 text-red-600 hover:text-red-700 transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
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
              <h3 className="text-lg font-semibold mb-4">Добавить аннотацию</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Текст аннотации
                  </label>
                  <textarea
                    value={newAnnotation.content}
                    onChange={(e) => setNewAnnotation({
                      ...newAnnotation,
                      content: e.target.value
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Введите текст аннотации..."
                  />
                </div>
                
                {attachment.pages && attachment.pages > 1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Страница
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={attachment.pages}
                      value={newAnnotation.page}
                      onChange={(e) => setNewAnnotation({
                        ...newAnnotation,
                        page: parseInt(e.target.value) || 1
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      X позиция
                    </label>
                    <input
                      type="number"
                      value={newAnnotation.rect.x}
                      onChange={(e) => setNewAnnotation({
                        ...newAnnotation,
                        rect: { ...newAnnotation.rect, x: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Y позиция
                    </label>
                    <input
                      type="number"
                      value={newAnnotation.rect.y}
                      onChange={(e) => setNewAnnotation({
                        ...newAnnotation,
                        rect: { ...newAnnotation.rect, y: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
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
                  onClick={handleAddAnnotation}
                  disabled={!newAnnotation.content.trim()}
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