'use client';
import { useEffect, useState, useRef } from 'react';
import { getChatMessages, sendMessage } from '@/lib/chat/api';
import { ChatMessage } from '@/lib/chat/real-data';
import { chatBus, emitLocalText, emitLocalFile, emitAck, emitFail } from '@/lib/chat/bus';
import type { LocalFilePayload, LocalTextPayload } from '@/lib/chat/bus';
import { Pin, User, Shield, Bot, Clock } from 'lucide-react';
import { FileAttachment } from './FileAttachment';
import { FileCarousel } from './FileCarousel';
import MessageBubble from './MessageBubble';
import PhotoGallery from './PhotoGallery';
import InlinePhotoViewer from './InlinePhotoViewer';

type Props = {
  chatId: string;
  messages?: ChatMessage[];
  onSendMessage?: (content: string) => void;
};

export default function RealMessageList({ chatId, messages: propMessages, onSendMessage }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselFiles, setCarouselFiles] = useState<any[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [quotedMessage, setQuotedMessage] = useState<ChatMessage | null>(null);
  
  // Состояние для галереи фото
  const [photoGalleryOpen, setPhotoGalleryOpen] = useState(false);
  const [photoGalleryPhotos, setPhotoGalleryPhotos] = useState<any[]>([]);
  const [photoGalleryIndex, setPhotoGalleryIndex] = useState(0);
  
  // Состояние для встроенного просмотрщика фото
  const [inlinePhotoViewerOpen, setInlinePhotoViewerOpen] = useState(false);
  const [inlinePhotoViewerPhotos, setInlinePhotoViewerPhotos] = useState<any[]>([]);
  const [inlinePhotoViewerIndex, setInlinePhotoViewerIndex] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Загрузка сообщений
  useEffect(() => {
    const loadMessages = async () => {
      try {
        console.log('RealMessageList: Starting to load messages for chatId:', chatId);
        setLoading(true);
        
        // Сначала проверяем localStorage
        const { loadChatMessages } = await import('@/lib/chat/persistence');
        const storedMessages = loadChatMessages(chatId);
        console.log('RealMessageList: Stored messages from localStorage:', storedMessages);
        
        if (storedMessages.length > 0) {
          console.log('RealMessageList: loading stored messages:', storedMessages);
          setMessages(storedMessages);
          setLoading(false);
          return;
        }
        
        // Если в localStorage нет сообщений, загружаем из API
        console.log('RealMessageList: No stored messages, loading from API...');
        const chatMessages = await getChatMessages(chatId);
        console.log('RealMessageList: API returned messages:', chatMessages);
        setMessages(chatMessages);
        
        // Сохраняем системные сообщения в localStorage
        if (chatMessages.length > 0) {
          const { saveChatMessages } = await import('@/lib/chat/persistence');
          saveChatMessages(chatId, chatMessages);
          console.log('Saved system messages to localStorage:', chatMessages);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [chatId]);

  // Обновление сообщений из пропсов (только новые сообщения)
  useEffect(() => {
    if (propMessages && propMessages.length > 0) {
      console.log('RealMessageList: updating messages from props', propMessages);
      setMessages(prev => {
        // Объединяем существующие сообщения с новыми
        const existingIds = new Set(prev.map(m => m.id));
        const newMessages = propMessages.filter(m => !existingIds.has(m.id));
        
        if (newMessages.length > 0) {
          console.log('RealMessageList: adding new messages', newMessages);
          const updatedMessages = [...prev, ...newMessages];
          
          // Сохраняем обновленные сообщения в localStorage
          import('@/lib/chat/persistence').then(({ saveChatMessages }) => {
            saveChatMessages(chatId, updatedMessages);
          });
          
          return updatedMessages;
        }
        
        return prev;
      });
    }
  }, [propMessages, chatId]);

  // Автоскролл к низу при новых сообщениях
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Обработка локальных событий от Composer
  useEffect(() => {
    function onLocalText(e: Event) {
      console.log('RealMessageList: received local-text event', e);
      const { chatId: cid, tempId, text, createdAtISO } = (e as CustomEvent<LocalTextPayload>).detail;
      console.log('RealMessageList: event details', { cid, tempId, text, createdAtISO, currentChatId: chatId });
      if (cid !== chatId) return;
      
      console.log('RealMessageList: creating new message');
      const newMessage: ChatMessage = {
        id: tempId,
        type: 'user',
        content: text,
        timestamp: createdAtISO,
        sender: {
          name: 'Вы',
          role: 'USER'
        },
        isPinned: false
      };
      
      console.log('RealMessageList: adding message to list', newMessage);
      setMessages(prev => {
        console.log('RealMessageList: current messages', prev);
        const updated = [...prev, newMessage];
        console.log('RealMessageList: updated messages', updated);
        return updated;
      });
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    }
    
    function onLocalFile(e: Event) {
      const { chatId: cid, tempId, file, createdAtISO } = (e as CustomEvent<LocalFilePayload>).detail;
      if (cid !== chatId) return;
      
      const newMessage: ChatMessage = {
        id: tempId,
        type: 'user',
        content: `📎 Файл: ${file.name}`,
        timestamp: createdAtISO,
        sender: {
          name: 'Вы',
          role: 'USER'
        },
        isPinned: false
      };
      
      setMessages(prev => [...prev, newMessage]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    }
    
    function onAck(e: Event) {
      const { chatId: cid, tempId, serverId } = (e as CustomEvent<any>).detail;
      if (cid !== chatId) return;
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: serverId } : m));
    }
    
    function onFail(e: Event) {
      const { chatId: cid, tempId } = (e as CustomEvent<any>).detail;
      if (cid !== chatId) return;
      console.log('Message failed to send:', tempId);
    }

    // Обработчик для открытия галереи фото
    function onOpenPhotoGallery(e: Event) {
      const { photos, currentIndex } = (e as CustomEvent).detail;
      setInlinePhotoViewerPhotos(photos);
      setInlinePhotoViewerIndex(currentIndex);
      setInlinePhotoViewerOpen(true);
    }

    console.log('RealMessageList: registering event listeners for chatId:', chatId);
    chatBus.addEventListener('local-text', onLocalText);
    chatBus.addEventListener('local-file', onLocalFile);
    chatBus.addEventListener('ack', onAck);
    chatBus.addEventListener('fail', onFail);
    window.addEventListener('openPhotoGallery', onOpenPhotoGallery);
    
    return () => {
      console.log('RealMessageList: removing event listeners for chatId:', chatId);
      chatBus.removeEventListener('local-text', onLocalText);
      chatBus.removeEventListener('local-file', onLocalFile);
      chatBus.removeEventListener('ack', onAck);
      chatBus.removeEventListener('fail', onFail);
      window.removeEventListener('openPhotoGallery', onOpenPhotoGallery);
    };
  }, [chatId]);

  // Обработка отправки сообщения (только для отображения)
  const handleSendMessage = (content: string) => {
    if (onSendMessage) {
      onSendMessage(content);
    }
    
    // Если есть цитируемое сообщение, добавляем его в новое сообщение
    if (quotedMessage) {
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        type: 'user',
        content: content,
        timestamp: new Date().toISOString(),
        sender: {
          name: 'Вы',
          role: 'USER'
        },
        quotedMessage: quotedMessage
      };
      
      setMessages(prev => [newMessage, ...prev]);
    }
    
    // Очищаем цитирование после отправки сообщения
    setQuotedMessage(null);
  };


  // Функции для карусели
  const openCarousel = (files: any[], index: number) => {
    setCarouselFiles(files);
    setCarouselIndex(index);
    setCarouselOpen(true);
  };

  const closeCarousel = () => {
    setCarouselOpen(false);
    setCarouselFiles([]);
    setCarouselIndex(0);
  };

  const handleFileView = (file: any, messageAttachments: any[]) => {
    openCarousel(messageAttachments, messageAttachments.findIndex(f => f.id === file.id));
  };

  const handleFileDownload = (file: any) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="h-4 w-4 animate-spin" />
          <span>Загрузка сообщений...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Индикатор цитирования */}
      {quotedMessage && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs text-blue-600 font-medium mb-1">
                Цитирование сообщения
              </div>
              <div className="text-sm text-gray-700 line-clamp-1">
                {quotedMessage.sender?.name || 'Система'}: {quotedMessage.content}
              </div>
            </div>
            <button
              onClick={() => setQuotedMessage(null)}
              className="ml-2 p-1 text-blue-600 hover:text-blue-800"
              title="Отменить цитирование"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Список сообщений */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.type === 'user' && message.sender?.name === 'Вы'}
            onCopy={(message) => {
              console.log('Copy message:', message.content);
              // Копируем текст в буфер обмена
              navigator.clipboard.writeText(message.content || '').then(() => {
                console.log('Message copied to clipboard');
              }).catch(err => {
                console.error('Failed to copy message:', err);
              });
            }}
            onQuote={(message) => {
              console.log('Quote message:', message.content);
              setQuotedMessage(message);
              // Фокусируемся на поле ввода для ответа
              const inputElement = document.querySelector('textarea[data-testid="composer-input"]') as HTMLTextAreaElement;
              if (inputElement) {
                inputElement.focus();
                inputElement.placeholder = `Ответ на сообщение от ${message.sender?.name || 'Система'}: "${message.content?.substring(0, 50)}${message.content && message.content.length > 50 ? '...' : ''}"`;
              }
            }}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Карусель для просмотра файлов */}
      <FileCarousel
        isOpen={carouselOpen}
        onClose={closeCarousel}
        files={carouselFiles}
        currentIndex={carouselIndex}
        onDownload={handleFileDownload}
      />

      {/* Галерея фото */}
      <PhotoGallery
        isOpen={photoGalleryOpen}
        onClose={() => setPhotoGalleryOpen(false)}
        photos={photoGalleryPhotos}
        currentIndex={photoGalleryIndex}
        onDownload={(id) => {
          const photo = photoGalleryPhotos.find(p => p.id === id);
          if (photo?.url) {
            const link = document.createElement('a');
            link.href = photo.url;
            link.download = photo.fileName || photo.name || 'photo';
            link.click();
          }
        }}
      />

      {/* Встроенный просмотрщик фото */}
      <InlinePhotoViewer
        isOpen={inlinePhotoViewerOpen}
        onClose={() => setInlinePhotoViewerOpen(false)}
        photos={inlinePhotoViewerPhotos}
        currentIndex={inlinePhotoViewerIndex}
        onDownload={(id) => {
          const photo = inlinePhotoViewerPhotos.find(p => p.id === id);
          if (photo?.url) {
            const link = document.createElement('a');
            link.href = photo.url;
            link.download = photo.fileName || photo.name || 'photo';
            link.click();
          }
        }}
        onOpenFullscreen={() => {
          setInlinePhotoViewerOpen(false);
          setPhotoGalleryPhotos(inlinePhotoViewerPhotos);
          setPhotoGalleryIndex(inlinePhotoViewerIndex);
          setPhotoGalleryOpen(true);
        }}
      />
    </div>
  );
}
