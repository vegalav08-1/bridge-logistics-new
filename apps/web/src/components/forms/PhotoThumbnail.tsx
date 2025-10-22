'use client';
import { useState, useEffect } from 'react';
import { Camera, X, Eye } from 'lucide-react';

interface PhotoThumbnailProps {
  photoUrl?: string;
  onPhotoChange: (url?: string) => void;
  onViewGallery: () => void;
}

export default function PhotoThumbnail({ photoUrl, onPhotoChange, onViewGallery }: PhotoThumbnailProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.stopPropagation(); // Предотвращаем всплытие события
    setIsUploading(true);
    try {
      // Здесь будет логика загрузки файла
      // Пока используем URL.createObjectURL для демонстрации
      const url = URL.createObjectURL(file);
      onPhotoChange(url);
    } catch (error) {
      console.error('Ошибка загрузки фото:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем всплытие события
    onPhotoChange(undefined);
  };

  // Показываем статичный placeholder до монтирования
  if (!mounted) {
    return (
      <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
        <Camera className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  if (photoUrl) {
    return (
      <div className="relative group">
        <div 
          className="w-16 h-16 rounded-lg border-2 border-gray-200 overflow-hidden cursor-pointer hover:border-blue-300 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onViewGallery();
          }}
        >
          <img 
            src={photoUrl} 
            alt="Фото товара" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Кнопки управления */}
        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewGallery();
              }}
              className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
              title="Просмотреть в галерее"
            >
              <Eye className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              title="Удалить фото"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={isUploading}
        className="hidden"
        id="photo-upload"
      />
      <label htmlFor="photo-upload" className="cursor-pointer">
        {isUploading ? (
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Camera className="w-6 h-6 text-gray-400" />
        )}
      </label>
    </div>
  );
}
