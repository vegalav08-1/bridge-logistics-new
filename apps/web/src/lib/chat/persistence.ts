// Утилиты для постоянного хранения сообщений чата
import { ChatMessage } from './api';

const STORAGE_KEY_PREFIX = 'chat_messages_';

/**
 * Сохранить сообщения чата в localStorage
 */
export function saveChatMessages(chatId: string, messages: ChatMessage[]): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${chatId}`;
    localStorage.setItem(key, JSON.stringify(messages));
    console.log(`Saved ${messages.length} messages for chat ${chatId}`);
  } catch (error) {
    console.error('Failed to save chat messages:', error);
  }
}

/**
 * Загрузить сообщения чата из localStorage
 */
export function loadChatMessages(chatId: string): ChatMessage[] {
  try {
    const key = `${STORAGE_KEY_PREFIX}${chatId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const messages = JSON.parse(stored);
      console.log(`Loaded ${messages.length} messages for chat ${chatId}`);
      return messages;
    }
  } catch (error) {
    console.error('Failed to load chat messages:', error);
  }
  return [];
}

/**
 * Добавить новое сообщение к существующим
 */
export function addChatMessage(chatId: string, newMessage: ChatMessage): void {
  try {
    const existingMessages = loadChatMessages(chatId);
    const updatedMessages = [...existingMessages, newMessage];
    saveChatMessages(chatId, updatedMessages);
    console.log(`Added message to chat ${chatId}:`, newMessage);
  } catch (error) {
    console.error('Failed to add chat message:', error);
  }
}

/**
 * Очистить сообщения чата
 */
export function clearChatMessages(chatId: string): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${chatId}`;
    localStorage.removeItem(key);
    console.log(`Cleared messages for chat ${chatId}`);
  } catch (error) {
    console.error('Failed to clear chat messages:', error);
  }
}

/**
 * Получить все ключи чатов
 */
export function getAllChatKeys(): string[] {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        keys.push(key.replace(STORAGE_KEY_PREFIX, ''));
      }
    }
    return keys;
  } catch (error) {
    console.error('Failed to get chat keys:', error);
    return [];
  }
}

