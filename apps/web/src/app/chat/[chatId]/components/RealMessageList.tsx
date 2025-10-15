'use client';
import { useEffect, useState, useRef } from 'react';
import { getChatMessages, sendMessage } from '@/lib/chat/api';
import { ChatMessage } from '@/lib/chat/real-data';
import { chatBus, emitLocalText, emitLocalFile, emitAck, emitFail } from '@/lib/chat/bus';
import type { LocalFilePayload, LocalTextPayload } from '@/lib/chat/bus';
import { Pin, User, Shield, Bot, Clock } from 'lucide-react';
import { FileAttachment } from './FileAttachment';
import { FileCarousel } from './FileCarousel';

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
  const bottomRef = useRef<HTMLDivElement>(null);

  // Загрузка сообщений
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        
        // Сначала проверяем localStorage
        const { loadChatMessages } = await import('@/lib/chat/persistence');
        const storedMessages = loadChatMessages(chatId);
        
        if (storedMessages.length > 0) {
          console.log('RealMessageList: loading stored messages:', storedMessages);
          setMessages(storedMessages);
          setLoading(false);
          return;
        }
        
        // Если в localStorage нет сообщений, загружаем из API
        const chatMessages = await getChatMessages(chatId);
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

    console.log('RealMessageList: registering event listeners for chatId:', chatId);
    chatBus.addEventListener('local-text', onLocalText);
    chatBus.addEventListener('local-file', onLocalFile);
    chatBus.addEventListener('ack', onAck);
    chatBus.addEventListener('fail', onFail);
    
    return () => {
      console.log('RealMessageList: removing event listeners for chatId:', chatId);
      chatBus.removeEventListener('local-text', onLocalText);
      chatBus.removeEventListener('local-file', onLocalFile);
      chatBus.removeEventListener('ack', onAck);
      chatBus.removeEventListener('fail', onFail);
    };
  }, [chatId]);

  // Обработка отправки сообщения (только для отображения)
  const handleSendMessage = (content: string) => {
    if (onSendMessage) {
      onSendMessage(content);
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

  // Форматирование времени
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      {/* Список сообщений */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isPinned ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}
            data-shipment-info={message.isPinned && message.metadata?.action === 'shipment_info' ? 'true' : undefined}
          >
            <div className="flex-1">
              {/* Заголовок сообщения */}
              <div className="flex items-center gap-2 mb-1">
                {getMessageIcon(message.type)}
                <span className="font-medium text-sm text-gray-700">
                  {message.sender?.name || 'Система'}
                </span>
                {message.isPinned && (
                  <Pin className="h-3 w-3 text-yellow-500" />
                )}
                <span className="text-xs text-gray-500">
                  {formatTime(message.timestamp)}
                </span>
              </div>

                 {/* Содержимое сообщения */}
                 <div 
                   className="text-sm text-gray-800 whitespace-pre-wrap"
                   dangerouslySetInnerHTML={{ 
                     __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                   }}
                 />
                 
                 {/* Отображение файлов */}
                 {message.attachments && message.attachments.length > 0 && (
                   <div className="mt-3 space-y-2">
                     {message.attachments.map((attachment: any, index: number) => (
                       <FileAttachment
                         key={index}
                         file={{
                           id: attachment.id || `attachment-${index}`,
                           name: attachment.fileName || attachment.name || 'Файл',
                           size: attachment.size || 0,
                           type: attachment.mimeType || attachment.type || 'application/octet-stream',
                           url: attachment.url || attachment.downloadUrl || '#'
                         }}
                         isUploaded={true} // Файлы в сообщениях уже отправлены
                         onDownload={handleFileDownload}
                         onView={(file) => handleFileView(file, message.attachments || [])}
                       />
                     ))}
                   </div>
                 )}
            </div>
          </div>
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
    </div>
  );
}
