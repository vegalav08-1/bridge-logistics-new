import React from 'react';
import { ImageCard } from './ImageCard';
import { PDFCard } from './PDFCard';
import { FileCard } from './FileCard';
import { VideoCard } from './VideoCard';

export interface MessageBubbleProps {
  message: {
    id: string;
    kind: string;
    payload: unknown;
    createdAt: string;
    author?: {
      id: string;
      email: string;
      role: string;
    } | null;
  };
  currentUserId?: string;
}

export function MessageBubble({ message, currentUserId }: MessageBubbleProps) {
  const isOwn = message.author?.id === currentUserId;
  const isSystem = message.kind === 'system';

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessageContent = () => {
    if (isSystem) {
      return (
        <div className="text-sm text-gray-600 italic">
          {(message.payload as { text?: string })?.text || 'Системное сообщение'}
        </div>
      );
    }

    if (message.kind === 'text') {
      const payload = message.payload as { text?: string } | string;
      const text = typeof payload === 'string' ? payload : payload?.text;
      return (
        <div className="text-sm text-gray-900 whitespace-pre-wrap">
          {text}
        </div>
      );
    }

    // S7: Поддержка файлов
    if (message.kind === 'image') {
      const payload = message.payload as { 
        attachmentId: string; 
        name: string; 
        mime: string; 
        bytes: number;
        width?: number;
        height?: number;
        thumbKey?: string;
      };
      return (
        <ImageCard
          attachmentId={payload.attachmentId}
          fileName={payload.name}
          mime={payload.mime}
          bytes={payload.bytes}
          width={payload.width}
          height={payload.height}
          thumbKey={payload.thumbKey}
        />
      );
    }

    if (message.kind === 'video') {
      const payload = message.payload as { 
        attachmentId: string; 
        name: string; 
        mime: string; 
        bytes: number;
        thumbKey?: string;
      };
      return (
        <VideoCard
          attachmentId={payload.attachmentId}
          fileName={payload.name}
          mime={payload.mime}
          bytes={payload.bytes}
          thumbKey={payload.thumbKey}
        />
      );
    }

    if (message.kind === 'file') {
      const payload = message.payload as { 
        attachmentId: string; 
        name: string; 
        mime: string; 
        bytes: number;
        pages?: number;
        thumbKey?: string;
      };
      
      // Определяем тип файла для рендера
      if (payload.mime === 'application/pdf') {
        return (
          <PDFCard
            attachmentId={payload.attachmentId}
            fileName={payload.name}
            mime={payload.mime}
            bytes={payload.bytes}
            pages={payload.pages}
            thumbKey={payload.thumbKey}
          />
        );
      }
      
      return (
        <FileCard
          attachmentId={payload.attachmentId}
          fileName={payload.name}
          mime={payload.mime}
          bytes={payload.bytes}
        />
      );
    }

    return (
      <div className="text-sm text-gray-600">
        Неподдерживаемый тип сообщения: {message.kind}
      </div>
    );
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-full text-xs">
          {renderMessageContent()}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && message.author && (
          <div className="text-xs text-gray-500 mb-1 px-1">
            {message.author.email}
          </div>
        )}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-brand text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {renderMessageContent()}
        </div>
        <div className={`text-xs text-gray-500 mt-1 px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}
