'use client';
import { useState, useEffect } from 'react';
import { Camera, X, Eye, Plus } from 'lucide-react';
import PhotoGallery from './PhotoGallery';

interface MultiPhotoThumbnailProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  itemId?: string; // Добавляем уникальный ID для товара
}

export default function MultiPhotoThumbnail({ 
  photos = [], 
  onPhotosChange, 
  maxPhotos = 3,
  itemId = 'default'
}: MultiPhotoThumbnailProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    event.stopPropagation();
    setIsUploading(true);

    try {
      const newPhotos: string[] = [];
      for (const file of files) {
        if (photos.length + newPhotos.length >= maxPhotos) break;
        const url = URL.createObjectURL(file);
        newPhotos.push(url);
      }
      
      onPhotosChange([...photos, ...newPhotos]);
    } catch (error) {
      console.error('Ошибка загрузки фото:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const handleViewGallery = (index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {/* Существующие фото */}
        {photos.map((photo, index) => (
          <div key={index} className="relative group">
            <div 
              className="w-16 h-16 rounded-lg border-2 border-gray-200 overflow-hidden cursor-pointer hover:border-blue-300 transition-colors"
              onClick={() => handleViewGallery(index)}
            >
              <img 
                src={photo} 
                alt={`Фото ${index + 1}`} 
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
                    handleViewGallery(index);
                  }}
                  className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                  title="Просмотреть в галерее"
                >
                  <Eye className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto(index);
                  }}
                  className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  title="Удалить фото"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Кнопка добавления */}
        {canAddMore && (
          <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              id={`multi-photo-upload-${itemId}`}
            />
            <label htmlFor={`multi-photo-upload-${itemId}`} className="cursor-pointer">
              {isUploading ? (
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-6 h-6 text-gray-400" />
              )}
            </label>
          </div>
        )}
      </div>

      {/* Информация о лимите */}
      {photos.length > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          {photos.length} из {maxPhotos} фото
        </div>
      )}

      {/* Галерея */}
      <PhotoGallery
        photos={photos}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        initialIndex={galleryIndex}
      />
    </>
  );
}
