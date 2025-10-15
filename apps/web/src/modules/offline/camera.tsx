'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { compressImage, createThumbnail, CompressedImage } from './image-utils';

interface CameraSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, compressed: CompressedImage) => void;
  mode?: 'photo' | 'video';
}

export function CameraSheet({ isOpen, onClose, onCapture, mode = 'photo' }: CameraSheetProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Инициализация камеры
  const initializeCamera = useCallback(async () => {
    try {
      setError(null);
      
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: mode === 'video'
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera initialization failed:', err);
      setError('Не удалось получить доступ к камере. Проверьте разрешения.');
    }
  }, [facingMode, mode]);

  // Остановка камеры
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Смена камеры
  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // Сделать фото
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Устанавливаем размеры canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Рисуем кадр на canvas
      ctx.drawImage(video, 0, 0);

      // Конвертируем в blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to capture photo'));
        }, 'image/jpeg', 0.9);
      });

      // Создаем File объект
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });

      // Сжимаем изображение
      const compressed = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.8,
        stripExif: true
      });

      // Создаем превью
      const thumbnail = await createThumbnail(file, 200);

      onCapture(file, compressed);
      onClose();
      
    } catch (err) {
      console.error('Photo capture failed:', err);
      setError('Ошибка при создании фото');
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, onCapture, onClose]);

  // Эффекты
  useEffect(() => {
    if (isOpen) {
      initializeCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, initializeCamera, stopCamera]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Видео */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Скрытый canvas для захвата */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* Overlay с рамкой */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border-2 border-white border-dashed rounded-lg opacity-50" />
        </div>

        {/* Индикатор захвата */}
        {isCapturing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-lg">Создание фото...</div>
          </div>
        )}
      </div>

      {/* Панель управления */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
        <div className="flex items-center justify-between text-white">
          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className="p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Кнопка съемки */}
          <button
            onClick={capturePhoto}
            disabled={isCapturing}
            className="w-16 h-16 rounded-full bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isCapturing ? (
              <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white border-4 border-gray-300" />
            )}
          </button>

          {/* Кнопка смены камеры */}
          <button
            onClick={switchCamera}
            className="p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-500 text-white p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Индикатор камеры */}
      <div className="absolute top-4 left-4 text-white text-sm">
        {facingMode === 'environment' ? '📷' : '🤳'}
      </div>
    </div>
  );
}

// Хук для работы с камерой
export function useCamera() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    // Проверяем поддержку камеры
    const checkSupport = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsSupported(false);
        return;
      }

      try {
        // Проверяем разрешения
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setPermission(result.state);
        setIsSupported(true);
      } catch {
        setIsSupported(true); // Предполагаем поддержку, если не можем проверить разрешения
      }
    };

    checkSupport();
  }, []);

  return {
    isSupported,
    permission,
    requestPermission: async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setPermission('granted');
        return true;
      } catch {
        setPermission('denied');
        return false;
      }
    }
  };
}




