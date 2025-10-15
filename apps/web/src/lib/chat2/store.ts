import { useState, useEffect, useCallback } from 'react';
import type { Chat, Message } from './types';

type State = {
  chats: Record<string, Chat>;
  messages: Record<string, Message[]>;
};

// Simple store implementation without zustand
class Chat2Store {
  private state: State = {
    chats: {},
    messages: {}
  };
  
  private listeners: Set<() => void> = new Set();

  getState(): State {
    return { ...this.state };
  }

  setState(newState: Partial<State>): void {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setChat(chat: Chat): void {
    this.setState({
      chats: { ...this.state.chats, [chat.id]: chat }
    });
  }

  setMessages(chatId: string, messages: Message[]): void {
    this.setState({
      messages: { ...this.state.messages, [chatId]: messages }
    });
  }

  prependMessage(chatId: string, message: Message): void {
    this.setState({
      messages: {
        ...this.state.messages,
        [chatId]: [message, ...(this.state.messages[chatId] || [])]
      }
    });
  }

  updateMessage(chatId: string, message: Message): void {
    this.setState({
      messages: {
        ...this.state.messages,
        [chatId]: (this.state.messages[chatId] || []).map(m => 
          m.id === message.id ? message : m
        )
      }
    });
  }
}

const store = new Chat2Store();

// React hook for using the store
export function useChat2Store() {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState(store.getState());
    });
    return unsubscribe;
  }, []);

  return {
    ...state,
    setChat: useCallback((chat: Chat) => store.setChat(chat), []),
    setMessages: useCallback((chatId: string, messages: Message[]) => store.setMessages(chatId, messages), []),
    prependMessage: useCallback((chatId: string, message: Message) => store.prependMessage(chatId, message), []),
    updateMessage: useCallback((chatId: string, message: Message) => store.updateMessage(chatId, message), [])
  };
}