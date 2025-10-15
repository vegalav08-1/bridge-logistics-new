'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Компонент для просмотра текстовых файлов
function TextFileViewer({ file }: { file: any }) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadTextFile = async () => {
      try {
        setLoading(true);
        const response = await fetch(file.url);
        if (!response.ok) {
          throw new Error('Не удалось загрузить файл');
        }
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    loadTextFile();
  }, [file.url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Загрузка файла...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-600">
          <p>Ошибка: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-sm text-gray-600 mb-2 p-2 bg-gray-50 rounded flex-shrink-0">
        Текстовый файл: {file.name}
      </div>
      <div className="flex-1 overflow-auto w-full h-full">
        <pre className="whitespace-pre-wrap text-sm text-gray-800 p-4 bg-gray-50 w-full h-full overflow-auto">
          {content}
        </pre>
      </div>
    </div>
  );
}

interface FileCarouselProps {
  isOpen: boolean;
  onClose: () => void;
  files: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }>;
  currentIndex: number;
  onDownload?: (file: any) => void;
}

export function FileCarousel({ isOpen, onClose, files, currentIndex, onDownload }: FileCarouselProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || files.length === 0) return null;

  const currentFile = files[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
      {/* Simple Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          {currentFile.name}
        </h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Закрыть"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Content - Only the file */}
      <div className="relative w-full h-full bg-white">
        {currentFile.type.startsWith('image/') ? (
          <img
            src={currentFile.url}
            alt={currentFile.name}
            className="w-full h-full object-contain"
          />
        ) : currentFile.type.startsWith('video/') ? (
          <video
            src={currentFile.url}
            controls
            className="w-full h-full object-contain"
          >
            Ваш браузер не поддерживает видео.
          </video>
        ) : currentFile.type === 'application/pdf' || currentFile.type.includes('pdf') ? (
          <iframe
            src={currentFile.url}
            className="w-full h-full border-0"
            title={currentFile.name}
          />
        ) : currentFile.type.includes('spreadsheet') || currentFile.type.includes('excel') || currentFile.type.includes('csv') ? (
          <div className="w-full h-full flex flex-col">
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(currentFile.url)}`}
              className="flex-1 border-0 w-full h-full"
              title={currentFile.name}
            />
          </div>
        ) : currentFile.type.startsWith('text/') || currentFile.name.endsWith('.txt') ? (
          <TextFileViewer file={currentFile} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-2">Файл не может быть предварительно просмотрен</p>
              <p className="text-sm text-gray-500 mb-4">{currentFile.name}</p>
              {onDownload && (
                <button
                  onClick={() => onDownload(currentFile)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Скачать файл
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}