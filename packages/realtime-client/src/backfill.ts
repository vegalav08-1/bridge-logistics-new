import { MessageCreatedEventData } from './types';

/**
 * Backfill service for fetching missed messages after reconnection
 */
export class BackfillService {
  private baseUrl: string;
  private token: string;
  private limit: number;

  constructor(baseUrl: string, token: string, limit = 50) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.limit = limit;
  }

  /**
   * Fetch messages for a chat since a given timestamp
   */
  async fetchMessagesSince(chatId: string, since: number): Promise<MessageCreatedEventData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/chats/${chatId}/messages?since=${since}&limit=${this.limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Backfill request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform API response to event data format
      return data.messages?.map((msg: Record<string, unknown>) => ({
        chatId,
        message: {
          id: msg.id,
          seq: msg.seq,
          kind: msg.kind,
          payload: msg.payload,
          authorId: msg.authorId,
          createdAt: msg.createdAt,
        },
      })) || [];

    } catch (error) {
      console.error('Backfill failed:', error);
      return [];
    }
  }

  /**
   * Fetch messages for multiple chats since a given timestamp
   */
  async fetchMultipleChatsSince(chatIds: string[], since: number): Promise<Map<string, MessageCreatedEventData[]>> {
    const results = new Map<string, MessageCreatedEventData[]>();
    
    // Fetch messages for each chat in parallel
    const promises = chatIds.map(async (chatId) => {
      try {
        const messages = await this.fetchMessagesSince(chatId, since);
        results.set(chatId, messages);
      } catch (error) {
        console.error(`Backfill failed for chat ${chatId}:`, error);
        results.set(chatId, []);
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Get the last message timestamp for a chat
   */
  async getLastMessageTimestamp(chatId: string): Promise<number | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/chats/${chatId}/messages?limit=1&order=desc`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const lastMessage = data.messages?.[0];
      
      return lastMessage ? new Date(lastMessage.createdAt).getTime() : null;

    } catch (error) {
      console.error('Failed to get last message timestamp:', error);
      return null;
    }
  }
}
