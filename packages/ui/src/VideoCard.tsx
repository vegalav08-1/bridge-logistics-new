import React, { useState } from 'react';
import { getFileIcon } from '@yp/files/mime';

interface VideoCardProps {
  attachmentId: string;
  fileName: string;
  mime: string;
  bytes: number;
  thumbKey?: string;
  className?: string;
}

export function VideoCard({
  attachmentId,
  fileName,
  mime,
  bytes,
  thumbKey,
  className = '',
}: VideoCardProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);

  // Форматируем размер файла
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Загружаем URL видео
  React.useEffect(() => {
    const loadVideoUrl = async () => {
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
          setVideoUrl(data.url);
        } else {
          setError('Failed to load video');
        }
      } catch (err) {
        setError('Failed to load video');
        console.error('Error loading video:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideoUrl();
  }, [attachmentId, thumbKey]);

  const handlePlay = () => {
    setShowControls(true);
  };

  const handleDownload = async () => {
    try {
      if (videoUrl) {
        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      setError('Failed to download video');
      console.error('Error downloading video:', err);
    }
  };

  if (error) {
    return (
      <div className={`rounded-2xl border border-red-200 bg-red-50 p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <span className="text-2xl">❌</span>
          <div>
            <p className="font-medium text-red-800">Failed to load video</p>
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
          {/* Иконка видео */}
          <div className="flex-shrink-0">
            <span className="text-3xl">{getFileIcon('video')}</span>
          </div>

          {/* Информация о файле */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{fileName}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
              <span>Video</span>
              <span>•</span>
              <span>{formatFileSize(bytes)}</span>
            </div>
          </div>

          {/* Кнопка скачивания */}
          <button
            onClick={handleDownload}
            className="flex-shrink-0 bg-gray-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
          >
            Download
          </button>
        </div>

        {/* Превью/видео */}
        <div className="mt-3">
          {isLoading ? (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : showControls && videoUrl ? (
            <div className="relative">
              <video
                src={videoUrl}
                controls
                className="w-full aspect-video rounded-lg"
                onError={() => setError('Failed to play video')}
              />
            </div>
          ) : (
            <div className="relative">
              {thumbUrl ? (
                <div className="relative">
                  <img
                    src={thumbUrl}
                    alt={`${fileName} preview`}
                    className="w-full aspect-video object-cover rounded-lg"
                    onError={() => setError('Failed to load preview')}
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                    <button
                      onClick={handlePlay}
                      className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
                    >
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <button
                    onClick={handlePlay}
                    className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




