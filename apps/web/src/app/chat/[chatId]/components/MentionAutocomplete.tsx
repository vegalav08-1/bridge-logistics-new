'use client';
import { useEffect, useRef, useState } from 'react';
import { User } from 'lucide-react';

type MentionUser = {
  id: string;
  name: string;
  avatar?: string;
};

type Props = {
  query: string;
  position: { top: number; left: number };
  onSelect: (user: MentionUser) => void;
  onClose: () => void;
  users: MentionUser[];
};

export default function MentionAutocomplete({ 
  query, 
  position, 
  onSelect, 
  onClose, 
  users 
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Фильтруем пользователей по запросу
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(query.toLowerCase())
  );

  // Обработка клавиш
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredUsers.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredUsers.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredUsers[selectedIndex]) {
          onSelect(filteredUsers[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredUsers, onSelect, onClose]);

  // Сброс выбранного индекса при изменении списка
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredUsers.length]);

  if (filteredUsers.length === 0) {
    return null;
  }

  return (
    <div
      ref={listRef}
      className="absolute z-50 w-64 bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {filteredUsers.map((user, index) => (
        <button
          key={user.id}
          type="button"
          className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 ${
            index === selectedIndex ? 'bg-blue-50 text-blue-600' : ''
          }`}
          onClick={() => onSelect(user)}
        >
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
            ) : (
              <User className="h-4 w-4 text-gray-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{user.name}</div>
            <div className="text-xs text-gray-500">@{user.name.toLowerCase().replace(/\s+/g, '')}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

