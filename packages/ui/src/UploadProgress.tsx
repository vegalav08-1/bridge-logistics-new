import React from 'react';

export interface UploadProgressProps {
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  className?: string;
  onSend?: () => void;
  onRetry?: () => void;
}

export function UploadProgress({
  fileName,
  progress,
  status,
  error,
  className = '',
  onSend,
  onRetry,
}: UploadProgressProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        );
      case 'processing':
        return (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
        );
      case 'completed':
        return (
          <div className="rounded-full h-4 w-4 bg-green-500 flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="rounded-full h-4 w-4 bg-red-500 flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
    }
  };

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        {/* Статус иконка */}
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>

        {/* Информация о файле */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{fileName}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
            <span>{getStatusText()}</span>
            {status === 'uploading' && (
              <span>•</span>
            )}
            {status === 'uploading' && (
              <span>{Math.round(progress)}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Прогресс бар */}
      {status === 'uploading' && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getStatusColor()}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Ошибка */}
      {status === 'error' && error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Кнопки действий */}
      {status === 'completed' && onSend && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={onSend}
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Отправить в чат
          </button>
        </div>
      )}

      {status === 'error' && onRetry && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
          >
            Повторить
          </button>
        </div>
      )}
    </div>
  );
}
