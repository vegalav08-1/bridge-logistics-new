'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
  supportedFormats?: string[];
  showTorch?: boolean;
}

export function QRScannerModal({ 
  isOpen, 
  onClose, 
  onScan, 
  supportedFormats = ['QR_CODE', 'CODE_128', 'EAN_13'],
  showTorch = true 
}: QRScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Инициализация сканера
  const initializeScanner = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(true);

      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      // Настраиваем форматы
      // Set supported formats
      reader.hints = new Map();
      reader.hints.set('POSSIBLE_FORMATS', supportedFormats);

      // Получаем доступные устройства
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('Камера не найдена');
      }

      // Выбираем заднюю камеру, если доступна
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      );
      
      const selectedDevice = backCamera || videoInputDevices[0];

      // Настраиваем обработчик результатов
      reader.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current!,
        (result: Result | null, error?: Error) => {
          if (result) {
            const text = result.getText();
            
            // Предотвращаем повторное сканирование того же кода
            if (text !== lastResult) {
              setLastResult(text);
              onScan(text);
              onClose();
            }
          }
          
          if (error && error.name !== 'NotFoundException') {
            console.warn('QR scan error:', error);
          }
        }
      );

      // Получаем поток для управления фонариком
      if (videoRef.current && videoRef.current.srcObject) {
        streamRef.current = videoRef.current.srcObject as MediaStream;
      }

    } catch (err) {
      console.error('QR Scanner initialization failed:', err);
      setError('Не удалось инициализировать сканер. Проверьте разрешения камеры.');
      setIsScanning(false);
    }
  }, [supportedFormats, onScan, onClose, lastResult]);

  // Остановка сканера
  const stopScanner = useCallback(() => {
    if (readerRef.current) {
      // Stop the reader
      readerRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsScanning(false);
  }, []);

  // Переключение фонарика
  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return;

    try {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack && 'applyConstraints' in videoTrack) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: !torchEnabled }] as any
        });
        setTorchEnabled(!torchEnabled);
      }
    } catch (err) {
      console.warn('Torch not supported:', err);
    }
  }, [torchEnabled]);

  // Эффекты
  useEffect(() => {
    if (isOpen) {
      initializeScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen, initializeScanner, stopScanner]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

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

        {/* Overlay с рамкой сканирования */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Рамка */}
            <div className="w-64 h-64 border-2 border-white border-dashed rounded-lg opacity-50" />
            
            {/* Уголки */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-lg" />
            <div className="absolute -top-2 -right-2 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-lg" />
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-lg" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-lg" />
          </div>
        </div>

        {/* Индикатор сканирования */}
        {isScanning && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

          {/* Инструкция */}
          <div className="text-center">
            <div className="text-sm opacity-75">Наведите камеру на QR-код</div>
            <div className="text-xs opacity-50 mt-1">Поддерживаются: QR, Code-128, EAN-13</div>
          </div>

          {/* Кнопка фонарика */}
          {showTorch && (
            <button
              onClick={toggleTorch}
              className={`p-3 rounded-full transition-colors ${
                torchEnabled 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-black bg-opacity-50 text-white hover:bg-opacity-70'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
          )}
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
    </div>
  );
}

// Хук для работы с QR сканером
export function useQRScanner() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    const checkSupport = async () => {
      // Проверяем поддержку getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsSupported(false);
        return;
      }

      try {
        // Проверяем разрешения камеры
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setPermission(result.state);
        setIsSupported(true);
      } catch {
        setIsSupported(true); // Предполагаем поддержку
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

// Утилиты для работы с QR кодами
export function parseQRCode(text: string): {
  type: 'chat' | 'shipment' | 'tracking' | 'url' | 'unknown';
  data: any;
} {
  try {
    // Проверяем, является ли это URL
    if (text.startsWith('http://') || text.startsWith('https://')) {
      const url = new URL(text);
      
      // Проверяем, является ли это ссылкой на чат
      if (url.pathname.includes('/chat/')) {
        const chatId = url.pathname.split('/chat/')[1];
        return { type: 'chat', data: { chatId, url: text } };
      }
      
      // Проверяем, является ли это ссылкой на отгрузку
      if (url.pathname.includes('/shipment/')) {
        const shipmentId = url.pathname.split('/shipment/')[1];
        return { type: 'shipment', data: { shipmentId, url: text } };
      }
      
      return { type: 'url', data: { url: text } };
    }

    // Проверяем, является ли это трекинг-номером
    if (/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(text) || /^\d{13}$/.test(text)) {
      return { type: 'tracking', data: { trackingNumber: text } };
    }

    // Проверяем, является ли это ID чата
    if (/^[a-z0-9]{20,}$/.test(text)) {
      return { type: 'chat', data: { chatId: text } };
    }

    return { type: 'unknown', data: { text } };
  } catch {
    return { type: 'unknown', data: { text } };
  }
}
