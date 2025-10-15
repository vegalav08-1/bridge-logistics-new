'use client';

import React from 'react';
import { 
  DocumentIcon, 
  PhotoIcon, 
  VideoCameraIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
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

interface AttachmentCardProps {
  attachment: Attachment;
  onOpen: (attachment: Attachment) => void;
  onDownload: (attachment: Attachment) => void;
  onAnnotate: (attachment: Attachment) => void;
  onVersions: (attachment: Attachment) => void;
}

export const AttachmentCard: React.FC<AttachmentCardProps> = ({
  attachment,
  onOpen,
  onDownload,
  onAnnotate,
  onVersions
}) => {
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

  const getFileIcon = (type: string, mime: string) => {
    if (type === 'image') {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    } else if (type === 'video') {
      return <VideoCameraIcon className="h-8 w-8 text-purple-500" />;
    } else if (mime.includes('pdf')) {
      return <DocumentIcon className="h-8 w-8 text-red-500" />;
    } else {
      return <DocumentIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const getFileTypeLabel = (type: string, mime: string): string => {
    if (type === 'image') return 'Изображение';
    if (type === 'video') return 'Видео';
    if (mime.includes('pdf')) return 'PDF';
    if (mime.includes('word') || mime.includes('document')) return 'Документ';
    if (mime.includes('sheet') || mime.includes('excel')) return 'Таблица';
    return 'Файл';
  };

  const getSafetyIcon = (isSafe: boolean) => {
    if (isSafe) {
      return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
    } else {
      return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
    }
  };

  const getSafetyLabel = (isSafe: boolean): string => {
    return isSafe ? 'Безопасен' : 'Подозрительный';
  };

  const getSafetyColor = (isSafe: boolean): string => {
    return isSafe ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {getFileIcon(attachment.type, attachment.mime)}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate" title={attachment.fileName}>
              {attachment.fileName}
            </h3>
            <p className="text-sm text-gray-500">
              {getFileTypeLabel(attachment.type, attachment.mime)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {getSafetyIcon(attachment.isSafe)}
        </div>
      </div>

      {/* File Info */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Размер:</span>
          <span className="font-medium">{formatFileSize(attachment.bytes)}</span>
        </div>
        
        {attachment.width && attachment.height && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Разрешение:</span>
            <span className="font-medium">{attachment.width}×{attachment.height}</span>
          </div>
        )}
        
        {attachment.pages && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Страниц:</span>
            <span className="font-medium">{attachment.pages}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Загружен:</span>
          <span className="font-medium">{formatDate(attachment.uploadedAt)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Статус:</span>
          <span className={`font-medium ${getSafetyColor(attachment.isSafe)}`}>
            {getSafetyLabel(attachment.isSafe)}
          </span>
        </div>
      </div>

      {/* Features Status */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FLAGS.FILES_OCR_ENABLED && (
          <div className={`px-2 py-1 rounded-full text-xs ${
            attachment.meta?.ocrDone 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {attachment.meta?.ocrDone ? 'OCR ✓' : 'OCR ⏳'}
          </div>
        )}
        
        {FLAGS.FILES_ANNOTATIONS_ENABLED && (
          <div className={`px-2 py-1 rounded-full text-xs ${
            (attachment.annotations?.length || 0) > 0
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            Аннотации: {attachment.annotations?.length || 0}
          </div>
        )}
        
        {FLAGS.FILES_VERSIONING_ENABLED && (
          <div className={`px-2 py-1 rounded-full text-xs ${
            (attachment.versions?.length || 0) > 0
              ? 'bg-purple-100 text-purple-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            Версии: {attachment.versions?.length || 0}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => onOpen(attachment)}
          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <EyeIcon className="h-4 w-4" />
          <span className="text-sm">Открыть</span>
        </button>
        
        <button
          onClick={() => onDownload(attachment)}
          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          <span className="text-sm">Скачать</span>
        </button>
      </div>

      {/* Additional Actions */}
      <div className="flex space-x-2 mt-2">
        {FLAGS.FILES_ANNOTATIONS_ENABLED && (
          <button
            onClick={() => onAnnotate(attachment)}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
            <span className="text-sm">Аннотации</span>
          </button>
        )}
        
        {FLAGS.FILES_VERSIONING_ENABLED && (
          <button
            onClick={() => onVersions(attachment)}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <DocumentDuplicateIcon className="h-4 w-4" />
            <span className="text-sm">Версии</span>
          </button>
        )}
      </div>
    </div>
  );
};