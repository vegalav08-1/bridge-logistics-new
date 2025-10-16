import React, { useState } from 'react';
import { getFileIcon, getFileType } from '@yp/files/mime';

interface FileCardProps {
  attachmentId: string;
  fileName: string;
  mime: string;
  bytes: number;
  className?: string;
}

export function FileCard({
  attachmentId,
  fileName,
  mime,
  bytes,
  className = '',
}: FileCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Форматируем размер файла
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Получаем тип файла и иконку
  const fileType = getFileType(mime);
  const icon = getFileIcon(fileType);

  // Получаем расширение файла
  const getFileExtension = (fileName: string): string => {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot >= 0 ? fileName.substring(lastDot + 1).toUpperCase() : '';
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setError(null);

      const response = await fetch(`/api/files/${attachmentId}/url`);
      if (response.ok) {
        const data = await response.json();
        
        // Создаем временную ссылку для скачивания
        const link = document.createElement('a');
        link.href = data.url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setError('Failed to download file');
      }
    } catch (err) {
      setError('Failed to download file');
      console.error('Error downloading file:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpen = async () => {
    try {
      setError(null);

      const response = await fetch(`/api/files/${attachmentId}/url`);
      if (response.ok) {
        const data = await response.json();
        window.open(data.url, '_blank');
      } else {
        setError('Failed to open file');
      }
    } catch (err) {
      setError('Failed to open file');
      console.error('Error opening file:', err);
    }
  };

  if (error) {
    return (
      <div className={`rounded-2xl border border-red-200 bg-red-50 p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <span className="text-2xl">❌</span>
          <div>
            <p className="font-medium text-red-800">Failed to load file</p>
            <p className="text-sm text-red-600">{fileName}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        {/* Иконка файла */}
        <div className="flex-shrink-0">
          <span className="text-3xl">{icon}</span>
        </div>

        {/* Информация о файле */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{fileName}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
            <span>{getFileExtension(fileName)}</span>
            <span>•</span>
            <span>{formatFileSize(bytes)}</span>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex-shrink-0 flex space-x-2">
          <button
            onClick={handleOpen}
            className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Open
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-gray-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? '...' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
}







