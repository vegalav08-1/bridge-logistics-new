'use client';

import React, { useState } from 'react';
import { Package, Search, Filter, ChevronDown } from 'lucide-react';

interface ChildChat {
  chatId: string;
  number: string;
  status: string;
  lastMessageAt: string;
}

interface ChildChatsDrawerProps {
  children: ChildChat[];
  onChildSelect: (chatId: string) => void;
  selectedChatId?: string;
}

export function ChildChatsDrawer({ 
  children, 
  onChildSelect, 
  selectedChatId 
}: ChildChatsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredChildren = children.filter(child => {
    const matchesSearch = child.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || child.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'ALL', label: 'Все статусы' },
    { value: 'NEW', label: 'Новая' },
    { value: 'IN_TRANSIT', label: 'В пути' },
    { value: 'ARRIVED', label: 'Прибыло' },
    { value: 'DELIVERED', label: 'Доставлено' }
  ];

  return (
    <div className="border-t border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-600" />
          <span className="font-medium">Дочерние отгрузки ({children.length})</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="border-t border-gray-200 bg-gray-50">
          {/* Search and filters */}
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по номеру отгрузки..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Children list */}
          <div className="max-h-64 overflow-y-auto">
            {filteredChildren.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm || statusFilter !== 'ALL' 
                  ? 'Отгрузки не найдены' 
                  : 'Нет дочерних отгрузок'
                }
              </div>
            ) : (
              <div className="space-y-1">
                {filteredChildren.map(child => (
                  <button
                    key={child.chatId}
                    onClick={() => onChildSelect(child.chatId)}
                    className={`w-full text-left p-3 hover:bg-white transition-colors ${
                      selectedChatId === child.chatId ? 'bg-white border-r-2 border-indigo-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{child.number}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(child.lastMessageAt).toLocaleString()}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        child.status === 'ARRIVED' ? 'bg-green-100 text-green-800' :
                        child.status === 'DELIVERED' ? 'bg-blue-100 text-blue-800' :
                        child.status === 'IN_TRANSIT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {child.status}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
