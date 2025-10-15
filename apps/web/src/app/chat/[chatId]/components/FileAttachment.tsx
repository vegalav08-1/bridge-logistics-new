'use client';

import { useState } from 'react';
import { Download, Eye, FileText, Image as ImageIcon, Video, FileSpreadsheet } from 'lucide-react';

interface FileAttachmentProps {
  file: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  };
  onDownload?: (file: any) => void;
  onView?: (file: any) => void;
  isUploaded?: boolean; // Показывать ли кнопку скачивания
  progress?: number; // Прогресс загрузки (0-100)
  status?: 'uploading' | 'completed' | 'error'; // Статус загрузки
}

export function FileAttachment({ file, onDownload, onView, isUploaded = false, progress, status }: FileAttachmentProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="h-3.5 w-3.5 text-blue-500" />;
    }
    if (type.startsWith('video/')) {
      return <Video className="h-3.5 w-3.5 text-purple-500" />;
    }
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) {
      return <FileSpreadsheet className="h-3.5 w-3.5 text-green-500" />;
    }
    if (type === 'application/pdf' || type.includes('pdf')) {
      return <FileText className="h-3.5 w-3.5 text-red-500" />;
    }
    return <FileText className="h-3.5 w-3.5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeColor = (type: string) => {
    if (type.startsWith('image/')) return 'border-blue-200 bg-blue-50';
    if (type.startsWith('video/')) return 'border-purple-200 bg-purple-50';
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) {
      return 'border-green-200 bg-green-50';
    }
    if (type === 'application/pdf' || type.includes('pdf')) {
      return 'border-red-200 bg-red-50';
    }
    return 'border-gray-200 bg-gray-50';
  };

  return (
    <div 
      className={`relative border rounded-lg p-1.5 transition-all duration-200 ${getFileTypeColor(file.type)} ${
        isHovered ? 'shadow-md scale-[1.02]' : 'shadow-sm'
      } max-w-[50%]`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-1.5">
        <div className="flex-shrink-0">
          {getFileIcon(file.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-900 truncate">
            {file.name}
          </div>
          <div className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </div>
        </div>
        
        <div className="flex-shrink-0 flex items-center gap-0.5">
          {onView && (
            <button
              onClick={() => onView(file)}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title="Просмотреть"
            >
              <Eye className="h-5 w-5 text-gray-600" />
            </button>
          )}
          {onDownload && isUploaded && (
            <button
              onClick={() => onDownload(file)}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title="Скачать"
            >
              <Download className="h-5 w-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>
      
      {/* Прогресс-бар загрузки */}
      {status === 'uploading' && progress !== undefined && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Загрузка...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-blue-500 h-1 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      )}
      
      {/* Индикатор ошибки */}
      {status === 'error' && (
        <div className="mt-2">
          <div className="text-xs text-red-600 flex items-center gap-1">
            <span>⚠️</span>
            <span>Ошибка загрузки</span>
          </div>
        </div>
      )}
      
      {/* Индикатор завершения */}
      {status === 'completed' && (
        <div className="mt-2">
          <div className="text-xs text-green-600 flex items-center gap-1">
            <span>✅</span>
            <span>Готов к отправке</span>
          </div>
        </div>
      )}
    </div>
  );
}
