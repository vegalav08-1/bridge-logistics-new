'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface PhotoGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Array<{
    id: string;
    url: string;
    fileName?: string;
    name?: string;
    size?: number;
  }>;
  currentIndex: number;
  onDownload?: (id: string) => void;
}

export default function PhotoGallery({ 
  isOpen, 
  onClose, 
  photos, 
  currentIndex, 
  onDownload 
}: PhotoGalleryProps) {
  const [index, setIndex] = useState(currentIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'z':
        case 'Z':
          toggleZoom();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const goToPrevious = () => {
    setIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const goToNext = () => {
    setIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const handleDownload = () => {
    if (onDownload && photos[index]) {
      onDownload(photos[index].id);
    }
  };

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[index];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
      {/* Закрыть */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Навигация */}
      {photos.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Основное изображение */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <img
          src={currentPhoto.url}
          alt={currentPhoto.fileName || currentPhoto.name || 'Фото'}
          className={`max-w-full max-h-full object-contain transition-transform duration-300 ${
            isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          onClick={toggleZoom}
        />
      </div>

      {/* Панель управления */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black bg-opacity-50 text-white rounded-full px-4 py-2">
        {/* Счетчик фото */}
        <span className="text-sm">
          {index + 1} из {photos.length}
        </span>

        {/* Кнопки действий */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleZoom}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-all duration-200"
            title={isZoomed ? 'Уменьшить' : 'Увеличить'}
          >
            {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
          </button>
          
          {onDownload && (
            <button
              onClick={handleDownload}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-all duration-200"
              title="Скачать"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Информация о файле */}
      <div className="absolute top-4 left-4 text-white">
        <div className="text-sm font-medium">
          {currentPhoto.fileName || currentPhoto.name || 'Фото'}
        </div>
        {currentPhoto.size && (
          <div className="text-xs opacity-70">
            {Math.round(currentPhoto.size / 1024)} KB
          </div>
        )}
      </div>
    </div>
  );
}
