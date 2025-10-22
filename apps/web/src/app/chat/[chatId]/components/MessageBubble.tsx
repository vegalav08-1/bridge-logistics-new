'use client';
import { useState } from 'react';
import type { ChatMessage } from '@/lib/chat/real-data';
import { User, Shield, Bot } from 'lucide-react';
import MessageContextMenu from './MessageContextMenu';
import PhotoThumbnail from './PhotoThumbnail';

export default function MessageBubble({
  message, isOwn, onCopy, onQuote
}:{
  message: ChatMessage;
  isOwn: boolean;
  onCopy?: (message: ChatMessage) => void;
  onQuote?: (message: ChatMessage) => void;
}) {
  const [contextMenu, setContextMenu] = useState<{
    isVisible: boolean;
    position: { x: number; y: number };
  }>({
    isVisible: false,
    position: { x: 0, y: 0 }
  });
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Обработчик правого клика мыши
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      isVisible: true,
      position: { x: event.clientX, y: event.clientY }
    });
  };

  // Обработчик долгого нажатия на мобильных устройствах
  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    setContextMenu({
      isVisible: true,
      position: { x: touch.clientX, y: touch.clientY }
    });
  };

  // Закрытие контекстного меню
  const handleCloseContextMenu = () => {
    setContextMenu({
      isVisible: false,
      position: { x: 0, y: 0 }
    });
  };

  // Обработчики для функций меню
  const handleCopy = (message: ChatMessage) => {
    if (onCopy) {
      onCopy(message);
    } else {
      // Fallback: копируем текст сообщения в буфер обмена
      navigator.clipboard.writeText(message.content || '');
    }
  };

  const handleQuote = (message: ChatMessage) => {
    if (onQuote) {
      onQuote(message);
    }
  };

  // Получение иконки для типа сообщения
  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <Bot className="h-4 w-4 text-blue-500" />;
      case 'user':
        return <User className="h-4 w-4 text-green-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-purple-500" />;
      case 'auto':
        return <Bot className="h-4 w-4 text-orange-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

      return (
        <>
          <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1.5`}>
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-1.5 cursor-pointer select-text relative ${
                isOwn
                  ? 'bg-green-100 text-green-900 border border-green-200'
                  : 'bg-gray-100 text-gray-900'
              }`}
              onContextMenu={handleContextMenu}
              onTouchStart={handleTouchStart}
              {...(message.isPinned ? { 'data-shipment-info': 'true' } : {})}
            >
              {/* Заголовок сообщения - показываем только для чужих сообщений */}
              {!isOwn && (
                <div className="flex items-center mb-1">
                  <div className="flex items-center gap-2">
                    {getMessageIcon(message.type)}
                    <span className="text-sm font-medium">
                      {message.sender?.name || 'Система'}
                    </span>
                  </div>
                </div>
              )}

        {/* Цитируемое сообщение - показываем только если это новое сообщение, которое цитирует другое */}
        {message.quotedMessage && (
          <div className="mb-2 p-2 bg-gray-50 border-l-4 border-gray-300 rounded-r-lg">
            <div className="text-xs text-gray-500 mb-1">
              {message.quotedMessage.sender?.name || 'Система'} • {formatTime(message.quotedMessage.timestamp)}
            </div>
            <div className="text-sm text-gray-700 line-clamp-2">
              {message.quotedMessage.content}
            </div>
          </div>
        )}

        {/* Текст сообщения */}
        {message.content && (
          <div 
            className="whitespace-pre-wrap text-sm mb-1"
            dangerouslySetInnerHTML={{ 
              __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            }}
          />
        )}

        {/* Отображение файлов */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2">
            {(() => {
              const images = message.attachments.filter((att: any) => 
                att.mime?.startsWith('image/') || 
                att.fileName?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) ||
                att.name?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)
              );
              const otherFiles = message.attachments.filter((att: any) => 
                !att.mime?.startsWith('image/') && 
                !att.fileName?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) &&
                !att.name?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)
              );

              return (
                <div className="space-y-2">
                  {/* Фото миниатюры */}
                  {images.length > 0 && (
                    <div className={`grid gap-2 ${
                      images.length === 1 ? 'grid-cols-1' :
                      images.length === 2 ? 'grid-cols-2' :
                      images.length === 3 ? 'grid-cols-2' :
                      'grid-cols-2'
                    }`}>
                      {images.slice(0, 4).map((attachment: any, index: number) => (
                        <PhotoThumbnail
                          key={attachment.id || index}
                          attachment={attachment}
                          onView={(id) => {
                            // Открываем галерею
                            const event = new CustomEvent('openPhotoGallery', {
                              detail: { photos: images, currentIndex: index }
                            });
                            window.dispatchEvent(event);
                          }}
                          onDownload={(id) => {
                            // Скачиваем файл
                            const attachment = images.find((att: any) => att.id === id);
                            if (attachment?.url) {
                              const link = document.createElement('a');
                              link.href = attachment.url;
                              link.download = attachment.fileName || attachment.name || 'photo';
                              link.click();
                            }
                          }}
                          className="max-w-[200px] sm:max-w-[250px] md:max-w-[300px]"
                        />
                      ))}
                      {images.length > 4 && (
                        <div className="flex items-center justify-center bg-gray-100 rounded-lg h-20 text-xs text-gray-500">
                          +{images.length - 4} фото
                        </div>
                      )}
                    </div>
                  )}

                  {/* Остальные файлы */}
                  {otherFiles.length > 0 && (
                    <div className="space-y-1">
                      {otherFiles.map((attachment: any, index: number) => (
                        <div key={attachment.id || index} className="text-xs opacity-70 flex items-center gap-1">
                          📎 {attachment.fileName || attachment.name || 'Файл'} 
                          ({Math.round((attachment.size || 0) / 1024)}KB)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Метаданные */}
        {message.metadata && (
          <div className="mt-1 text-xs opacity-70">
            {message.metadata.action && `Действие: ${message.metadata.action}`}
            {message.metadata.shipmentId && ` | Отгрузка: ${message.metadata.shipmentId}`}
          </div>
        )}

        {/* Время отправки в правом нижнем углу */}
        <div className="flex justify-end mt-1">
          <div className="text-[10px] opacity-60">
            {formatTime(message.timestamp)}
          </div>
        </div>

        </div>
      </div>

      {/* Контекстное меню */}
      <MessageContextMenu
        message={message}
        isVisible={contextMenu.isVisible}
        position={contextMenu.position}
        onClose={handleCloseContextMenu}
        onCopy={handleCopy}
        onQuote={handleQuote}
      />
    </>
  );
}