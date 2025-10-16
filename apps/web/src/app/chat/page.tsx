'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageCircle, Plus, Search, Users } from '@/components/icons';

export default function ChatPage() {
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for chats
    const mockChats = [
      {
        id: 'chat-1',
        title: 'Отгрузка #12345',
        lastMessage: 'Отгрузка готова к отправке',
        timestamp: '2024-01-15 14:30',
        unread: 2,
        status: 'active'
      },
      {
        id: 'chat-2',
        title: 'Отгрузка #12346',
        lastMessage: 'Ожидает подтверждения',
        timestamp: '2024-01-15 13:45',
        unread: 0,
        status: 'pending'
      },
      {
        id: 'chat-3',
        title: 'Отгрузка #12347',
        lastMessage: 'Доставлено',
        timestamp: '2024-01-15 12:20',
        unread: 0,
        status: 'completed'
      }
    ];
    
    setChats(mockChats);
    setLoading(false);
  }, []);

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const handleNewChat = () => {
    // Create new chat logic
    console.log('Creating new chat...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка чатов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Чаты
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Управление сообщениями и отгрузками
              </p>
            </div>
            <Button onClick={handleNewChat}>
              <Plus className="h-5 w-5 mr-2" />
              Новый чат
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по чатам..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Chats List */}
        <div className="space-y-4">
          {chats.map((chat) => (
            <Card 
              key={chat.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleChatClick(chat.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-4">
                      <MessageCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {chat.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {chat.lastMessage}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {chat.timestamp}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      chat.status === 'active' ? 'bg-green-100 text-green-800' :
                      chat.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {chat.status === 'active' ? 'Активный' :
                       chat.status === 'pending' ? 'Ожидает' :
                       'Завершен'}
                    </span>
                    {chat.unread > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {chats.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Нет активных чатов
            </h3>
            <p className="text-gray-600 mb-4">
              Создайте новый чат для начала работы
            </p>
            <Button onClick={handleNewChat}>
              <Plus className="h-5 w-5 mr-2" />
              Создать чат
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
