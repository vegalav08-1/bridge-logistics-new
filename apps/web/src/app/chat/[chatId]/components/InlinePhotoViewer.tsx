'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, RotateCw, Grid3X3, Maximize2 } from 'lucide-react';

interface InlinePhotoViewerProps {
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
  onOpenFullscreen?: () => void;
}

type ViewMode = 'grid' | 'carousel';

export default function InlinePhotoViewer({ 
  isOpen, 
  onClose, 
  photos, 
  currentIndex, 
  onDownload,
  onOpenFullscreen
}: InlinePhotoViewerProps) {
  const [index, setIndex] = useState(currentIndex);
  const [viewMode, setViewMode] = useState<ViewMode>('carousel');
  const [isZoomed, setIsZoomed] = useState(false);
  const [rotation, setRotation] = useState(0);

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
        case 'r':
        case 'R':
          rotateImage();
          break;
        case 'g':
        case 'G':
          setViewMode('grid');
          break;
        case 'c':
        case 'C':
          setViewMode('carousel');
          break;
        case 'f':
        case 'F':
          onOpenFullscreen?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, index, onOpenFullscreen]);

  const goToPrevious = () => {
    setIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    setRotation(0);
  };

  const goToNext = () => {
    setIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    setRotation(0);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (onDownload && photos[index]) {
      onDownload(photos[index].id);
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[index];

  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-80 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] w-full h-full flex flex-col overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            {/* Навигация */}
            {photos.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevious}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm font-medium">
                  {index + 1} из {photos.length}
                </span>
                <button
                  onClick={goToNext}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Информация о файле */}
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {currentPhoto.fileName || currentPhoto.name || 'Фото'}
              </div>
              {currentPhoto.size && (
                <div className="text-xs text-gray-500">
                  {formatSize(currentPhoto.size)}
                </div>
              )}
            </div>
          </div>

          {/* Режимы просмотра */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'
              }`}
              title="Сетка (G)"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('carousel')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'carousel' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'
              }`}
              title="Карусель (C)"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={onOpenFullscreen}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title="Полный экран (F)"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'grid' ? (
            <GridLayout 
              photos={photos} 
              currentIndex={index}
              onSelectPhoto={setIndex}
              onDownload={onDownload}
            />
          ) : (
            <CarouselLayout 
              photo={currentPhoto}
              isZoomed={isZoomed}
              rotation={rotation}
              onToggleZoom={toggleZoom}
              onRotate={rotateImage}
              onDownload={handleDownload}
            />
          )}
        </div>

        {/* Панель управления */}
        <div className="flex items-center justify-center gap-4 p-4 border-t bg-gray-50">
          {/* Навигация */}
          {photos.length > 1 && viewMode !== 'grid' && (
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevious}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm min-w-[60px] text-center">
                {index + 1} / {photos.length}
              </span>
              <button
                onClick={goToNext}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Действия */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleZoom}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title={isZoomed ? 'Уменьшить (Z)' : 'Увеличить (Z)'}
            >
              {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
            </button>
            
            <button
              onClick={rotateImage}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title="Повернуть (R)"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            
            {onDownload && (
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                title="Скачать"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент для сетки фото
function GridLayout({ 
  photos, 
  currentIndex, 
  onSelectPhoto, 
  onDownload 
}: {
  photos: any[];
  currentIndex: number;
  onSelectPhoto: (index: number) => void;
  onDownload?: (id: string) => void;
}) {
  return (
    <div className="w-full h-full overflow-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className={`relative group cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
              index === currentIndex ? 'ring-2 ring-blue-500' : 'hover:scale-105'
            }`}
            onClick={() => onSelectPhoto(index)}
          >
            <img
              src={photo.url}
              alt={photo.fileName || photo.name || 'Фото'}
              className="w-full h-32 object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {onDownload && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(photo.id);
                    }}
                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200"
                  >
                    <Download className="h-4 w-4 text-gray-700" />
                  </button>
                )}
              </div>
            </div>
            {index === currentIndex && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                Выбрано
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Компонент для карусели
function CarouselLayout({ 
  photo, 
  isZoomed, 
  rotation, 
  onToggleZoom, 
  onRotate, 
  onDownload
}: {
  photo: any;
  isZoomed: boolean;
  rotation: number;
  onToggleZoom: () => void;
  onRotate: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
      <img
        src={photo.url}
        alt={photo.fileName || photo.name || 'Фото'}
        className={`max-w-full max-h-full object-contain transition-all duration-300 ${
          isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
        }`}
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
        onClick={onToggleZoom}
      />
      
      {/* Индикатор поворота */}
      {rotation !== 0 && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {rotation}°
        </div>
      )}
    </div>
  );
}
