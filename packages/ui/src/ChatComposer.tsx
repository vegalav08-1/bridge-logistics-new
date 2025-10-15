/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { UploadProgress } from './UploadProgress';

export interface ChatComposerProps {
  onSendMessage: (text: string) => void;
  onUploadFile?: (file: File) => void;
  onSendFile?: (attachmentId: string) => void;
  disabled?: boolean;
  placeholder?: string;
  chatId?: string;
  token?: string;
}

export interface UploadState {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  attachmentId?: string;
  file?: File;
}

export function ChatComposer({ 
  onSendMessage, 
  onUploadFile,
  onSendFile,
  disabled = false, 
  placeholder = 'Напишите сообщение...',
  chatId,
  token
}: ChatComposerProps) {
  const [messageText, setMessageText] = useState('');
  const [uploadStates, setUploadStates] = useState<UploadState[]>([]);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() && !disabled) {
      onSendMessage(messageText.trim());
      setMessageText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 96); // max 4 lines (24px * 4)
      textarea.style.height = `${newHeight}px`;
    }
  }, [messageText]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        if (onUploadFile) {
          onUploadFile(file);
        } else {
          uploadFile(file);
        }
      });
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File) => {
    if (!chatId || !token) return;

    const uploadId = crypto.randomUUID();
    const uploadState: UploadState = {
      fileName: file.name,
      progress: 0,
      status: 'uploading',
      file
    };

    setUploadStates(prev => [...prev, uploadState]);

    try {
      // 1. Создаем upload session
      const createResponse = await fetch('/api/files/upload/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId,
          fileName: file.name,
          mime: file.type,
          bytes: file.size,
          sha256: await calculateSHA256(file),
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create upload session');
      }

      const { attachmentId, putUrl } = await createResponse.json();

      // 2. Загружаем файл в S3
      const uploadResponse = await fetch(putUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // 3. Завершаем upload
      const completeResponse = await fetch('/api/files/upload/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          attachmentId,
          clientId: uploadId,
        }),
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to complete upload');
      }

      // Обновляем статус
      setUploadStates(prev => prev.map(upload => 
        upload.fileName === file.name 
          ? { ...upload, status: 'completed', attachmentId, progress: 100 }
          : upload
      ));

    } catch (error: any) {
      setUploadStates(prev => prev.map(upload => 
        upload.fileName === file.name 
          ? { ...upload, status: 'error', error: error.message }
          : upload
      ));
    }
  };

  const calculateSHA256 = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSendFile = (attachmentId: string) => {
    if (onSendFile) {
      onSendFile(attachmentId);
      // Удаляем из списка загрузок
      setUploadStates(prev => prev.filter(upload => upload.attachmentId !== attachmentId));
    }
  };

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200">
      {/* Upload Progress */}
      {uploadStates.length > 0 && (
        <div className="p-4 border-b border-gray-200 space-y-2">
          {uploadStates.map((upload, index) => (
            <UploadProgress
              key={index}
              fileName={upload.fileName}
              progress={upload.progress}
              status={upload.status}
              error={upload.error}
              onSend={upload.status === 'completed' && upload.attachmentId ? () => handleSendFile(upload.attachmentId!) : undefined}
              onRetry={upload.status === 'error' && upload.file ? () => uploadFile(upload.file!) : undefined}
            />
          ))}
        </div>
      )}

      {/* File Input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
      />

      {/* Composer */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          {/* File Upload Button */}
          {onUploadFile && (
            <button
              type="button"
              onClick={handleFileButtonClick}
              disabled={disabled}
              className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
          )}

          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '96px' }}
            />
          </div>
          
          <button
            type="submit"
            disabled={!messageText.trim() || disabled}
            className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[40px] flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
