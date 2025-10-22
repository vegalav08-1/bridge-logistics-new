'use client';

import { useState } from 'react';
import { Eye, Download, X } from 'lucide-react';

interface PhotoThumbnailProps {
  attachment: {
    id: string;
    url: string;
    fileName?: string;
    name?: string;
    size?: number;
    mime?: string;
  };
  onView?: (id: string) => void;
  onDownload?: (id: string) => void;
  className?: string;
}

export default function PhotoThumbnail({ 
  attachment, 
  onView, 
  onDownload, 
  className = '' 
}: PhotoThumbnailProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView?.(attachment.id);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload?.(attachment.id);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Основная миниатюра */}
      <div className="relative overflow-hidden rounded-lg bg-gray-100">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
        
        {imageError ? (
          <div className="flex items-center justify-center h-32 bg-gray-100 text-gray-500">
            <div className="text-center">
              <div className="text-2xl mb-1">📷</div>
              <div className="text-xs">Ошибка загрузки</div>
            </div>
          </div>
        ) : (
          <img
            src={attachment.url}
            alt={attachment.fileName || attachment.name || 'Фото'}
            className="w-full h-auto object-cover transition-transform duration-200 group-hover:scale-105"
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}

        {/* Overlay с действиями */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <button
              onClick={handleView}
              className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200 hover:scale-110"
              title="Просмотр"
            >
              <Eye className="h-4 w-4 text-gray-700" />
            </button>
            {onDownload && (
              <button
                onClick={handleDownload}
                className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200 hover:scale-110"
                title="Скачать"
              >
                <Download className="h-4 w-4 text-gray-700" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Информация о файле */}
      <div className="mt-1 text-xs text-gray-500 truncate">
        {attachment.fileName || attachment.name || 'Фото'}
        {attachment.size && (
          <span className="ml-1">({formatSize(attachment.size)})</span>
        )}
      </div>
    </div>
  );
}
