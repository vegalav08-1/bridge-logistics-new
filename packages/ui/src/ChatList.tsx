import React from 'react';

export interface Chat {
  id: string;
  number: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  members: Array<{
    userId: string;
    role: string;
    joinedAt: string;
    user: {
      id: string;
      email: string;
      role: string;
    };
  }>;
  lastMessage?: {
    id: string;
    chatId: string;
    authorId?: string;
    kind: string;
    seq: number;
    clientId?: string;
    payload: any;
    createdAt: string;
    editedAt?: string;
    deletedAt?: string;
    author?: {
      id: string;
      email: string;
      role: string;
    } | null;
  } | null;
  unreadCount: number;
  hasUnread: boolean;
  lastReadSeq: number;
}

interface ChatListProps {
  chats: Chat[];
  currentChatId?: string;
  onChatSelect: (chatId: string) => void;
  className?: string;
}

export function ChatList({ chats, currentChatId, onChatSelect, className = '' }: ChatListProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('ru-RU', { 
        weekday: 'short' 
      });
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const getChatTitle = (chat: Chat) => {
    if (chat.type === 'REQUEST') {
      return `Запрос #${chat.number}`;
    } else if (chat.type === 'SHIPMENT') {
      return `Отгрузка #${chat.number}`;
    }
    return `Чат #${chat.number}`;
  };

  const getLastMessagePreview = (chat: Chat) => {
    if (!chat.lastMessage) {
      return 'Нет сообщений';
    }

    const { kind, payload, author } = chat.lastMessage;
    
    if (kind === 'text' && payload?.text) {
      const text = payload.text;
      return text.length > 50 ? `${text.substring(0, 50)}...` : text;
    } else if (kind === 'file') {
      return '📎 Файл';
    } else if (kind === 'image') {
      return '🖼️ Изображение';
    } else if (kind === 'system') {
      return '🔔 Системное сообщение';
    }
    
    return 'Сообщение';
  };

  return (
    <div className={`bg-gray-50 ${className}`}>
      <div className="p-6 border-b border-gray-300 bg-white">
        <h2 className="text-2xl font-bold text-gray-900">Чаты</h2>
        <p className="text-sm text-gray-600 mt-1">Выберите чат для общения</p>
      </div>
      
      <div className="overflow-y-auto h-full p-4">
        {chats.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-lg">Нет доступных чатов</p>
            <p className="text-sm mt-2">Создайте новый чат или дождитесь приглашения</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`
                  relative bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-all duration-200
                  hover:shadow-md hover:border-gray-300
                  ${currentChatId === chat.id ? 'ring-2 ring-blue-500 border-blue-500' : ''}
                  ${chat.hasUnread ? 'border-green-500 bg-green-50' : ''}
                `}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm
                      ${chat.type === 'REQUEST' ? 'bg-blue-500' : 'bg-green-500'}
                    `}>
                      {chat.type === 'REQUEST' ? 'З' : 'О'}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {getChatTitle(chat)}
                      </h3>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {chat.hasUnread && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-sm">
                            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {chat.lastMessage ? formatTime(chat.lastMessage.createdAt) : formatTime(chat.updatedAt)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <p className={`
                        text-sm truncate leading-relaxed
                        ${chat.hasUnread ? 'text-gray-900 font-medium' : 'text-gray-600'}
                      `}>
                        {getLastMessagePreview(chat)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`
                        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                        ${chat.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          chat.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' :
                          chat.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'}
                      `}>
                        {chat.status}
                      </span>
                      {chat.hasUnread && (
                        <span className="text-xs text-green-600 font-medium">
                          Новые сообщения
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
