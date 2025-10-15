'use client';

import React, { useState, useRef, useCallback } from 'react';
import { outboxQueue } from '@/modules/offline/outbox';
import { CameraSheet } from '@/modules/offline/camera';
import { QRScannerModal } from '@/modules/offline/qr-scanner';
import { compressImage, createThumbnail, isImageFile, shouldCompress } from '@/modules/offline/image-utils';
import { usePWAFeatures } from '@/components/PWAProvider';
import { FLAGS } from '@yp/shared';

interface MessageInputProps {
  chatId: string;
  onMessageSent?: (message: any) => void;
  disabled?: boolean;
}

export function MessageInput({ chatId, onMessageSent, disabled = false }: MessageInputProps) {
  const [text, setText] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localAttachments, setLocalAttachments] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pwa = usePWAFeatures();

  const handleSendMessage = useCallback(async () => {
    if (!text.trim() && localAttachments.length === 0) return;

    try {
      if (pwa.isOffline) {
        // Офлайн режим - добавляем в очередь
        if (text.trim()) {
          const messageId = await outboxQueue.enqueueMessage(chatId, text.trim());
          console.log('Message queued for offline:', messageId);
        }

        if (localAttachments.length > 0) {
          for (const attachment of localAttachments) {
            const messageId = await outboxQueue.enqueueFile(chatId, attachment.file, attachment.meta);
            console.log('File queued for offline:', messageId);
          }
        }

        // Показываем уведомление
        alert('Сообщения будут отправлены при восстановлении сети');
      } else {
        // Онлайн режим - отправляем сразу
        // Здесь должна быть логика отправки через API
        console.log('Sending message online:', { text, attachments: localAttachments });
      }

      // Очищаем форму
      setText('');
      setLocalAttachments([]);
      onMessageSent?.({ text, attachments: localAttachments });

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Ошибка отправки сообщения');
    }
  }, [text, localAttachments, chatId, pwa.isOffline, onMessageSent]);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress((i / files.length) * 100);

        let processedFile = file;
        let thumbnail: Blob | null = null;

        // Обрабатываем изображения
        if (isImageFile(file)) {
          if (shouldCompress(file)) {
            const compressed = await compressImage(file, {
              maxWidth: 1600,
              maxHeight: 1600,
              quality: 0.8,
              stripExif: true
            });
            processedFile = new File([compressed.blob], file.name, { type: file.type });
            console.log(`Image compressed: ${file.size} -> ${compressed.compressedSize} bytes`);
          }

          thumbnail = await createThumbnail(processedFile, 200);
        }

        const attachment = {
          id: `temp_${Date.now()}_${i}`,
          file: processedFile,
          thumbnail,
          meta: {
            name: file.name,
            mime: file.type,
            size: processedFile.size,
            originalSize: file.size,
            isCompressed: processedFile.size !== file.size
          }
        };

        setLocalAttachments(prev => [...prev, attachment]);
      }

      setUploadProgress(100);
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Ошибка обработки файлов');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const handleCameraCapture = useCallback(async (file: File, compressed: any) => {
    const thumbnail = await createThumbnail(file, 200);
    
    const attachment = {
      id: `temp_${Date.now()}`,
      file,
      thumbnail,
      meta: {
        name: file.name,
        mime: file.type,
        size: compressed.compressedSize,
        originalSize: compressed.originalSize,
        isCompressed: true,
        dimensions: compressed.dimensions
      }
    };

    setLocalAttachments(prev => [...prev, attachment]);
    setIsCameraOpen(false);
  }, []);

  const handleQRScan = useCallback((result: string) => {
    // Добавляем QR результат как текст
    setText(prev => prev + (prev ? '\n' : '') + `QR: ${result}`);
    setIsQRScannerOpen(false);
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setLocalAttachments(prev => prev.filter(att => att.id !== id));
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      {/* Статус сети */}
      {pwa.isOffline && (
        <div className="mb-3 p-2 bg-orange-100 text-orange-700 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <span>Офлайн режим - сообщения будут отправлены при восстановлении сети</span>
          </div>
        </div>
      )}

      {/* Локальные вложения */}
      {localAttachments.length > 0 && (
        <div className="mb-3 space-y-2">
          {localAttachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              {attachment.thumbnail && (
                <img
                  src={URL.createObjectURL(attachment.thumbnail)}
                  alt="Preview"
                  className="w-8 h-8 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{attachment.meta.name}</div>
                <div className="text-xs text-gray-500">
                  {Math.round(attachment.meta.size / 1024)} KB
                  {attachment.meta.isCompressed && ' (сжато)'}
                </div>
              </div>
              <button
                onClick={() => removeAttachment(attachment.id)}
                className="text-gray-400 hover:text-red-500 p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Прогресс загрузки */}
      {isUploading && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Обработка файлов... {Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Поле ввода */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={pwa.isOffline ? "Вы офлайн, сообщения будут отправлены при подключении..." : "Напишите сообщение..."}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={1}
            disabled={disabled}
          />
        </div>

        {/* Кнопки действий */}
        <div className="flex items-center gap-1">
          {/* Файл */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Камера */}
          {FLAGS.CAMERA_QR_ENABLED && pwa.canUseCamera && (
            <button
              onClick={() => setIsCameraOpen(true)}
              disabled={disabled}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}

          {/* QR сканер */}
          {FLAGS.CAMERA_QR_ENABLED && pwa.canUseCamera && (
            <button
              onClick={() => setIsQRScannerOpen(true)}
              disabled={disabled}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </button>
          )}

          {/* Отправить */}
          <button
            onClick={handleSendMessage}
            disabled={disabled || (!text.trim() && localAttachments.length === 0)}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Скрытый input для файлов */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
      />

      {/* Модалы */}
      {FLAGS.CAMERA_QR_ENABLED && (
        <>
          <CameraSheet
            isOpen={isCameraOpen}
            onClose={() => setIsCameraOpen(false)}
            onCapture={handleCameraCapture}
          />
          
          <QRScannerModal
            isOpen={isQRScannerOpen}
            onClose={() => setIsQRScannerOpen(false)}
            onScan={handleQRScan}
          />
        </>
      )}
    </div>
  );
}




