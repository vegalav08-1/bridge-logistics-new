import React, { useState } from 'react';
import { getFileIcon } from '@yp/files/mime';

interface ImageCardProps {
  attachmentId: string;
  fileName: string;
  mime: string;
  bytes: number;
  width?: number;
  height?: number;
  thumbKey?: string;
  className?: string;
}

export function ImageCard({
  attachmentId,
  fileName,
  mime,
  bytes,
  width,
  height,
  thumbKey,
  className = '',
}: ImageCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);

  // Форматируем размер файла
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Загружаем URL изображения
  React.useEffect(() => {
    const loadImageUrl = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Сначала пытаемся загрузить превью
        if (thumbKey) {
          const thumbResponse = await fetch(`/api/files/${attachmentId}/url?thumb=1`);
          if (thumbResponse.ok) {
            const thumbData = await thumbResponse.json();
            setThumbUrl(thumbData.url);
          }
        }

        // Затем загружаем оригинал
        const response = await fetch(`/api/files/${attachmentId}/url`);
        if (response.ok) {
          const data = await response.json();
          setImageUrl(data.url);
        } else {
          setError('Failed to load image');
        }
      } catch (err) {
        setError('Failed to load image');
        console.error('Error loading image:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadImageUrl();
  }, [attachmentId, thumbKey]);

  const handleImageClick = () => {
    if (imageUrl) {
      setShowLightbox(true);
    }
  };

  const handleLightboxClose = () => {
    setShowLightbox(false);
  };

  if (error) {
    return (
      <div className={`rounded-2xl border border-red-200 bg-red-50 p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <span className="text-2xl">❌</span>
          <div>
            <p className="font-medium text-red-800">Failed to load image</p>
            <p className="text-sm text-red-600">{fileName}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`rounded-2xl border border-gray-200 bg-white overflow-hidden ${className}`}>
        {isLoading ? (
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="relative">
            {thumbUrl ? (
              <img
                src={thumbUrl}
                alt={fileName}
                className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                onClick={handleImageClick}
                onError={() => setError('Failed to load thumbnail')}
              />
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt={fileName}
                className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                onClick={handleImageClick}
                onError={() => setError('Failed to load image')}
              />
            ) : (
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <span className="text-4xl">{getFileIcon('image')}</span>
              </div>
            )}
            
            {/* Overlay с информацией */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <p className="text-white font-medium text-sm truncate">{fileName}</p>
              <div className="flex items-center justify-between text-xs text-white/80 mt-1">
                <span>{formatFileSize(bytes)}</span>
                {width && height && (
                  <span>{width} × {height}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && imageUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={handleLightboxClose}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={imageUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={handleLightboxClose}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}




