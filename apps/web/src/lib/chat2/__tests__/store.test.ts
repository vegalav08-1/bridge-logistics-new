import { useChat2Store } from '../store';
import type { Chat, Message } from '../types';

describe('useChat2Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useChat2Store.setState({ chats: {}, messages: {} });
  });

  describe('setChat', () => {
    it('should set chat in store', () => {
      const chat: Chat = {
        id: 'chat1',
        title: 'Test Chat',
        description: 'Test Description',
        visibility: 'PRIVATE',
        participants: [],
        settings: {
          allowInvites: true,
          allowMentions: true
        },
        createdAtISO: '2023-01-01T00:00:00Z',
        updatedAtISO: '2023-01-01T00:00:00Z'
      };

      useChat2Store.getState().setChat(chat);
      
      const state = useChat2Store.getState();
      expect(state.chats['chat1']).toEqual(chat);
    });
  });

  describe('setMessages', () => {
    it('should set messages for a chat', () => {
      const messages: Message[] = [
        {
          id: 'msg1',
          chatId: 'chat1',
          kind: 'text',
          text: 'Hello world',
          authorId: 'user1',
          createdAtISO: '2023-01-01T00:00:00Z',
          mentions: []
        }
      ];

      useChat2Store.getState().setMessages('chat1', messages);
      
      const state = useChat2Store.getState();
      expect(state.messages['chat1']).toEqual(messages);
    });
  });

  describe('prependMessage', () => {
    it('should add message to the beginning of messages list', () => {
      const existingMessages: Message[] = [
        {
          id: 'msg1',
          chatId: 'chat1',
          kind: 'text',
          text: 'First message',
          authorId: 'user1',
          createdAtISO: '2023-01-01T00:00:00Z',
          mentions: []
        }
      ];

      const newMessage: Message = {
        id: 'msg2',
        chatId: 'chat1',
        kind: 'text',
        text: 'New message',
        authorId: 'user2',
        createdAtISO: '2023-01-01T01:00:00Z',
        mentions: []
      };

      useChat2Store.getState().setMessages('chat1', existingMessages);
      useChat2Store.getState().prependMessage('chat1', newMessage);
      
      const state = useChat2Store.getState();
      expect(state.messages['chat1']).toHaveLength(2);
      expect(state.messages['chat1'][0]).toEqual(newMessage);
      expect(state.messages['chat1'][1]).toEqual(existingMessages[0]);
    });
  });

  describe('updateMessage', () => {
    it('should update existing message', () => {
      const messages: Message[] = [
        {
          id: 'msg1',
          chatId: 'chat1',
          kind: 'text',
          text: 'Original text',
          authorId: 'user1',
          createdAtISO: '2023-01-01T00:00:00Z',
          mentions: []
        }
      ];

      useChat2Store.getState().setMessages('chat1', messages);
      
      const updatedMessage = { ...messages[0], text: 'Updated text' };
      useChat2Store.getState().updateMessage('chat1', updatedMessage);
      
      const state = useChat2Store.getState();
      expect(state.messages['chat1'][0].text).toBe('Updated text');
    });
  });
});

