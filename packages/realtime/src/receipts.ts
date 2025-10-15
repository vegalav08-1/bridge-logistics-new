import { createClient, RedisClientType } from 'redis';
import { FLAGS } from '@yp/shared';

export interface ReceiptsConfig {
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  useRedis?: boolean;
}

export interface DeliveryReceipt {
  chatId: string;
  userId: string;
  maxSeq: number;
  lastDeliveredAt: string;
}

export interface ReadReceipt {
  chatId: string;
  userId: string;
  maxSeq: number;
  lastReadAt: string;
}

export interface ChatReceipts {
  delivered: Map<string, DeliveryReceipt>; // userId -> receipt
  read: Map<string, ReadReceipt>; // userId -> receipt
}

// In-memory реализация для dev
export class InMemoryReceiptsManager {
  private delivered = new Map<string, Map<string, DeliveryReceipt>>(); // chatId -> userId -> receipt
  private read = new Map<string, Map<string, ReadReceipt>>(); // chatId -> userId -> receipt

  async recordDelivery(chatId: string, userId: string, seq: number): Promise<void> {
    if (!FLAGS.DELIVERED_RECEIPTS_ENABLED) {
      return;
    }

    if (!this.delivered.has(chatId)) {
      this.delivered.set(chatId, new Map());
    }

    const chatDelivered = this.delivered.get(chatId)!;
    const existing = chatDelivered.get(userId);

    if (!existing || seq > existing.maxSeq) {
      chatDelivered.set(userId, {
        chatId,
        userId,
        maxSeq: seq,
        lastDeliveredAt: new Date().toISOString(),
      });
    }
  }

  async recordRead(chatId: string, userId: string, seq: number): Promise<void> {
    if (!FLAGS.READ_RECEIPTS_ENABLED) {
      return;
    }

    if (!this.read.has(chatId)) {
      this.read.set(chatId, new Map());
    }

    const chatRead = this.read.get(chatId)!;
    const existing = chatRead.get(userId);

    if (!existing || seq > existing.maxSeq) {
      chatRead.set(userId, {
        chatId,
        userId,
        maxSeq: seq,
        lastReadAt: new Date().toISOString(),
      });
    }
  }

  async getChatReceipts(chatId: string): Promise<ChatReceipts> {
    const delivered = this.delivered.get(chatId) || new Map();
    const read = this.read.get(chatId) || new Map();

    return {
      delivered: new Map(delivered),
      read: new Map(read),
    };
  }

  async getUserDeliveryReceipt(chatId: string, userId: string): Promise<DeliveryReceipt | null> {
    const chatDelivered = this.delivered.get(chatId);
    if (!chatDelivered) {
      return null;
    }

    return chatDelivered.get(userId) || null;
  }

  async getUserReadReceipt(chatId: string, userId: string): Promise<ReadReceipt | null> {
    const chatRead = this.read.get(chatId);
    if (!chatRead) {
      return null;
    }

    return chatRead.get(userId) || null;
  }

  async getUnreadCount(chatId: string, userId: string): Promise<number> {
    const deliveryReceipt = await this.getUserDeliveryReceipt(chatId, userId);
    const readReceipt = await this.getUserReadReceipt(chatId, userId);

    if (!deliveryReceipt) {
      return 0;
    }

    const maxDelivered = deliveryReceipt.maxSeq;
    const maxRead = readReceipt?.maxSeq || 0;

    return Math.max(0, maxDelivered - maxRead);
  }

  // Метрики для отладки
  getStats() {
    return {
      totalChats: this.delivered.size,
      totalDeliveredReceipts: Array.from(this.delivered.values()).reduce((sum, receipts) => sum + receipts.size, 0),
      totalReadReceipts: Array.from(this.read.values()).reduce((sum, receipts) => sum + receipts.size, 0),
    };
  }
}

// Redis реализация для prod
export class RedisReceiptsManager {
  private redis: RedisClientType;
  private isConnected = false;

  constructor(config: ReceiptsConfig['redis']) {
    const redisConfig = {
      socket: {
        host: config?.host || 'localhost',
        port: config?.port || 6379,
      },
      password: config?.password,
    };

    this.redis = createClient(redisConfig);
    this.setupRedis();
  }

  private async setupRedis(): Promise<void> {
    await this.redis.connect();
    this.isConnected = true;

    this.redis.on('error', (error) => {
      console.error('Redis receipts error:', error);
      this.isConnected = false;
    });
  }

  private getDeliveryKey(chatId: string, userId: string): string {
    return `rt:delivered:${chatId}:${userId}`;
  }

  private getReadKey(chatId: string, userId: string): string {
    return `rt:read:${chatId}:${userId}`;
  }

  private getChatDeliveryPattern(chatId: string): string {
    return `rt:delivered:${chatId}:*`;
  }

  private getChatReadPattern(chatId: string): string {
    return `rt:read:${chatId}:*`;
  }

  async recordDelivery(chatId: string, userId: string, seq: number): Promise<void> {
    if (!FLAGS.DELIVERED_RECEIPTS_ENABLED) {
      return;
    }

    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    const key = this.getDeliveryKey(chatId, userId);
    const existing = await this.redis.get(key);

    if (!existing || seq > parseInt(existing)) {
      await this.redis.set(key, seq.toString());
      await this.redis.expire(key, 7 * 24 * 60 * 60); // 7 days TTL
    }
  }

  async recordRead(chatId: string, userId: string, seq: number): Promise<void> {
    if (!FLAGS.READ_RECEIPTS_ENABLED) {
      return;
    }

    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    const key = this.getReadKey(chatId, userId);
    const existing = await this.redis.get(key);

    if (!existing || seq > parseInt(existing)) {
      await this.redis.set(key, seq.toString());
      await this.redis.expire(key, 7 * 24 * 60 * 60); // 7 days TTL
    }
  }

  async getChatReceipts(chatId: string): Promise<ChatReceipts> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    const delivered = new Map<string, DeliveryReceipt>();
    const read = new Map<string, ReadReceipt>();

    // Получаем все delivery receipts для чата
    const deliveryKeys = await this.redis.keys(this.getChatDeliveryPattern(chatId));
    for (const key of deliveryKeys) {
      const match = key.match(/rt:delivered:([^:]+):([^:]+)/);
      if (match) {
        const [, chatIdFromKey, userId] = match;
        const seq = await this.redis.get(key);
        if (seq) {
          delivered.set(userId, {
            chatId: chatIdFromKey,
            userId,
            maxSeq: parseInt(seq),
            lastDeliveredAt: new Date().toISOString(), // Redis не хранит timestamp
          });
        }
      }
    }

    // Получаем все read receipts для чата
    const readKeys = await this.redis.keys(this.getChatReadPattern(chatId));
    for (const key of readKeys) {
      const match = key.match(/rt:read:([^:]+):([^:]+)/);
      if (match) {
        const [, chatIdFromKey, userId] = match;
        const seq = await this.redis.get(key);
        if (seq) {
          read.set(userId, {
            chatId: chatIdFromKey,
            userId,
            maxSeq: parseInt(seq),
            lastReadAt: new Date().toISOString(), // Redis не хранит timestamp
          });
        }
      }
    }

    return { delivered, read };
  }

  async getUserDeliveryReceipt(chatId: string, userId: string): Promise<DeliveryReceipt | null> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    const key = this.getDeliveryKey(chatId, userId);
    const seq = await this.redis.get(key);

    if (!seq) {
      return null;
    }

    return {
      chatId,
      userId,
      maxSeq: parseInt(seq),
      lastDeliveredAt: new Date().toISOString(),
    };
  }

  async getUserReadReceipt(chatId: string, userId: string): Promise<ReadReceipt | null> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    const key = this.getReadKey(chatId, userId);
    const seq = await this.redis.get(key);

    if (!seq) {
      return null;
    }

    return {
      chatId,
      userId,
      maxSeq: parseInt(seq),
      lastReadAt: new Date().toISOString(),
    };
  }

  async getUnreadCount(chatId: string, userId: string): Promise<number> {
    const deliveryReceipt = await this.getUserDeliveryReceipt(chatId, userId);
    const readReceipt = await this.getUserReadReceipt(chatId, userId);

    if (!deliveryReceipt) {
      return 0;
    }

    const maxDelivered = deliveryReceipt.maxSeq;
    const maxRead = readReceipt?.maxSeq || 0;

    return Math.max(0, maxDelivered - maxRead);
  }

  async close(): Promise<void> {
    this.isConnected = false;
    await this.redis.quit();
  }

  getStats() {
    return {
      isConnected: this.isConnected,
    };
  }
}

// Фабрика для создания ReceiptsManager
export function createReceiptsManager(config: ReceiptsConfig = {}): InMemoryReceiptsManager | RedisReceiptsManager {
  if (config.useRedis && config.redis) {
    return new RedisReceiptsManager(config.redis);
  } else {
    return new InMemoryReceiptsManager();
  }
}

// Утилиты для работы с квитанциями
export function formatReceiptStatus(receipts: ChatReceipts, currentUserId: string): {
  delivered: string[];
  read: string[];
  unread: string[];
} {
  const delivered: string[] = [];
  const read: string[] = [];
  const unread: string[] = [];

  for (const [userId, deliveryReceipt] of Array.from(receipts.delivered.entries())) {
    if (userId === currentUserId) {
      continue; // Не показываем свои квитанции
    }

    delivered.push(userId);

    const readReceipt = receipts.read.get(userId);
    if (readReceipt && readReceipt.maxSeq >= deliveryReceipt.maxSeq) {
      read.push(userId);
    } else {
      unread.push(userId);
    }
  }

  return { delivered, read, unread };
}

export function getReceiptEmoji(status: 'delivered' | 'read' | 'unread'): string {
  switch (status) {
    case 'delivered':
      return '✓';
    case 'read':
      return '✓✓';
    case 'unread':
      return '○';
    default:
      return '○';
  }
}
