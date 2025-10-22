'use client';
import { useEffect, useRef, useState } from 'react';
import { Copy, Quote, Languages } from 'lucide-react';
import type { ChatMessage } from '@/lib/chat/real-data';

interface MessageContextMenuProps {
  message: ChatMessage;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onCopy: (message: ChatMessage) => void;
  onQuote: (message: ChatMessage) => void;
  onTranslate?: (message: ChatMessage) => void;
}

export default function MessageContextMenu({
  message,
  isVisible,
  position,
  onClose,
  onCopy,
  onQuote,
  onTranslate
}: MessageContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  // Закрытие меню при нажатии Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateY(-100%)' // Показываем меню выше курсора
      }}
    >
      {/* Скопировать */}
      <button
        onClick={() => {
          onCopy(message);
          onClose();
        }}
        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
      >
        <Copy className="h-4 w-4 text-gray-600" />
        Скопировать
      </button>

      {/* Цитировать */}
      <button
        onClick={() => {
          onQuote(message);
          onClose();
        }}
        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
      >
        <Quote className="h-4 w-4 text-gray-600" />
        Цитировать
      </button>

      {/* Перевести (пока неактивно) */}
      {onTranslate && (
        <button
          onClick={() => {
            onTranslate(message);
            onClose();
          }}
          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 opacity-50 cursor-not-allowed"
          disabled
        >
          <Languages className="h-4 w-4 text-gray-400" />
          Перевести
        </button>
      )}
    </div>
  );
}
