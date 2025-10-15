'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { FLAGS } from '@yp/shared';

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
  annotations?: any[];
  meta?: {
    ocrDone: boolean;
    ocrLang?: string;
  };
}

interface FileViewerProps {
  attachment: Attachment;
  isOpen: boolean;
  onClose: () => void;
  onAnnotate: (attachment: Attachment) => void;
}

export const FileViewer: React.FC<FileViewerProps> = ({
  attachment,
  isOpen,
  onClose,
  onAnnotate
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (isOpen && attachment) {
      loadFileUrl();
    }
  }, [isOpen, attachment]);

  const loadFileUrl = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/attachments/${attachment.id}/url`);
      if (!response.ok) {
        throw new Error('Failed to get file URL');
      }

      const data = await response.json();
      
      if (attachment.type === 'image') {
        setImageUrl(data.url);
      } else if (attachment.mime.includes('pdf')) {
        setPdfUrl(data.url);
      }
    } catch (error) {
      console.error('Error loading file:', error);
      setError('Ошибка загрузки файла');
    } finally {
      setIsLoading(false);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const handlePreviousPage = () => {
    if (attachment.pages && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (attachment.pages && currentPage < attachment.pages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] w-full mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {attachment.fileName}
            </h2>
            <span className="text-sm text-gray-500">
              {formatFileSize(attachment.bytes)}
            </span>
            {attachment.width && attachment.height && (
              <span className="text-sm text-gray-500">
                {attachment.width}×{attachment.height}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {FLAGS.FILES_ANNOTATIONS_ENABLED && (
              <button
                onClick={() => onAnnotate(attachment)}
                className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Аннотации
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              -
            </button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              +
            </button>
            <button
              onClick={handleResetZoom}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          </div>

          {attachment.pages && attachment.pages > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage <= 1}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ←
              </button>
              <span className="text-sm font-medium">
                {currentPage} / {attachment.pages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= attachment.pages}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Загрузка файла...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <p className="text-red-600 mb-2">{error}</p>
                <button
                  onClick={loadFileUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Попробовать снова
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto p-4">
              {attachment.type === 'image' && imageUrl && (
                <div className="flex items-center justify-center h-full">
                  <img
                    src={imageUrl}
                    alt={attachment.fileName}
                    className="max-w-full max-h-full object-contain"
                    style={{ transform: `scale(${zoom / 100})` }}
                  />
                </div>
              )}
              
              {attachment.mime.includes('pdf') && pdfUrl && (
                <div className="h-full">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full border-0"
                    title={attachment.fileName}
                  />
                </div>
              )}
              
              {attachment.type === 'video' && (
                <div className="flex items-center justify-center h-full">
                  <video
                    controls
                    className="max-w-full max-h-full"
                    style={{ transform: `scale(${zoom / 100})` }}
                  >
                    <source src={imageUrl || ''} type={attachment.mime} />
                    Ваш браузер не поддерживает видео.
                  </video>
                </div>
              )}
              
              {!['image', 'video'].includes(attachment.type) && !attachment.mime.includes('pdf') && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📄</div>
                    <p className="text-gray-600 mb-4">Превью недоступно для этого типа файла</p>
                    <a
                      href={imageUrl || pdfUrl || '#'}
                      download={attachment.fileName}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Скачать файл
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Тип: {attachment.mime}</span>
              {attachment.meta?.ocrDone && (
                <span className="text-green-600">OCR: ✓</span>
              )}
              {attachment.annotations && attachment.annotations.length > 0 && (
                <span className="text-blue-600">
                  Аннотации: {attachment.annotations.length}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span>Безопасность:</span>
              <span className={attachment.isSafe ? 'text-green-600' : 'text-red-600'}>
                {attachment.isSafe ? '✓ Безопасен' : '⚠ Подозрительный'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};