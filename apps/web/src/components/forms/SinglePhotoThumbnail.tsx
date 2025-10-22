'use client';
import { useState, useEffect } from 'react';
import { Plus, Eye, X, Camera } from 'lucide-react';

interface SinglePhotoThumbnailProps {
  photoUrl?: string;
  onPhotoChange: (photoUrl: string | undefined) => void;
  onViewGallery?: () => void;
  itemId?: string;
}

export default function SinglePhotoThumbnail({ 
  photoUrl, 
  onPhotoChange, 
  onViewGallery,
  itemId = 'default'
}: SinglePhotoThumbnailProps) {
  const [mounted, setMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Создаем локальный URL для предпросмотра
      const localUrl = URL.createObjectURL(file);
      onPhotoChange(localUrl);
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPhotoChange(undefined);
  };

  const handleViewGallery = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewGallery?.();
  };

  if (!mounted) {
    return (
      <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
        <Camera className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id={`single-photo-upload-${itemId}`}
          onChange={handleFileUpload}
        />
        <label htmlFor={`single-photo-upload-${itemId}`} className="cursor-pointer">
          {isUploading ? (
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="w-6 h-6 text-gray-400" />
          )}
        </label>
      </div>

      {photoUrl && (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
          <img
            src={photoUrl}
            alt="Фото посылки"
            className="w-full h-full object-cover"
            onClick={handleViewGallery}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 hover:opacity-100 transition-opacity flex gap-1">
              <button
                type="button"
                onClick={handleViewGallery}
                className="p-1 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-colors"
                title="Просмотр"
              >
                <Eye className="w-3 h-3 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="p-1 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-colors"
                title="Удалить"
              >
                <X className="w-3 h-3 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
