import React, { useState } from 'react';
import { getFileIcon } from '@yp/files/mime';

interface PDFCardProps {
  attachmentId: string;
  fileName: string;
  mime: string;
  bytes: number;
  pages?: number;
  thumbKey?: string;
  className?: string;
}

export function PDFCard({
  attachmentId,
  fileName,
  mime,
  bytes,
  pages,
  thumbKey,
  className = '',
}: PDFCardProps) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Форматируем размер файла
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Загружаем превью PDF
  React.useEffect(() => {
    const loadThumbnail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (thumbKey) {
          const response = await fetch(`/api/files/${attachmentId}/url?thumb=1`);
          if (response.ok) {
            const data = await response.json();
            setThumbUrl(data.url);
          }
        }
      } catch (err) {
        setError('Failed to load thumbnail');
        console.error('Error loading PDF thumbnail:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadThumbnail();
  }, [attachmentId, thumbKey]);

  const handleOpenPDF = async () => {
    try {
      const response = await fetch(`/api/files/${attachmentId}/url`);
      if (response.ok) {
        const data = await response.json();
        window.open(data.url, '_blank');
      } else {
        setError('Failed to open PDF');
      }
    } catch (err) {
      setError('Failed to open PDF');
      console.error('Error opening PDF:', err);
    }
  };

  if (error) {
    return (
      <div className={`rounded-2xl border border-red-200 bg-red-50 p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <span className="text-2xl">❌</span>
          <div>
            <p className="font-medium text-red-800">Failed to load PDF</p>
            <p className="text-sm text-red-600">{fileName}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white overflow-hidden ${className}`}>
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Иконка PDF */}
          <div className="flex-shrink-0">
            <span className="text-3xl">{getFileIcon('pdf')}</span>
          </div>

          {/* Информация о файле */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{fileName}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
              <span>PDF</span>
              <span>•</span>
              <span>{formatFileSize(bytes)}</span>
              {pages && (
                <>
                  <span>•</span>
                  <span>{pages} page{pages !== 1 ? 's' : ''}</span>
                </>
              )}
            </div>
          </div>

          {/* Кнопка открытия */}
          <button
            onClick={handleOpenPDF}
            className="flex-shrink-0 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Open
          </button>
        </div>

        {/* Превью (если доступно) */}
        {thumbUrl && (
          <div className="mt-3">
            {isLoading ? (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={thumbUrl}
                  alt={`${fileName} preview`}
                  className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={handleOpenPDF}
                  onError={() => setError('Failed to load preview')}
                />
                <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-medium">Click to open</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}







