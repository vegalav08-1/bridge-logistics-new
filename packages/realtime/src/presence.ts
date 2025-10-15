import { createClient, RedisClientType } from 'redis';
import { FLAGS } from '@yp/shared';

export interface PresenceConfig {
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  useRedis?: boolean;
}

export interface TypingUser {
  userId: string;
  startedAt: string;
  lastActivity: string;
}

export interface ChatPresence {
  chatId: string;
  typing: Map<string, TypingUser>; // userId -> typing info
}

// In-memory реализация для dev
export class InMemoryPresenceManager {
  private typing = new Map<string, Map<string, TypingUser>>(); // chatId -> userId -> typing info
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly TYPING_TIMEOUT = 6000; // 6 seconds

  constructor() {
    this.startCleanup();
  }

  async startTyping(chatId: string, userId: string): Promise<void> {
    if (!FLAGS.TYPING_INDICATORS_ENABLED) {
      return;
    }

    if (!this.typing.has(chatId)) {
      this.typing.set(chatId, new Map());
    }

    const chatTyping = this.typing.get(chatId)!;
    const now = new Date().toISOString();

    chatTyping.set(userId, {
      userId,
      startedAt: now,
      lastActivity: now,
    });
  }

  async stopTyping(chatId: string, userId: string): Promise<void> {
    if (!FLAGS.TYPING_INDICATORS_ENABLED) {
      return;
    }

    const chatTyping = this.typing.get(chatId);
    if (chatTyping) {
      chatTyping.delete(userId);
      if (chatTyping.size === 0) {
        this.typing.delete(chatId);
      }
    }
  }

  async updateTypingActivity(chatId: string, userId: string): Promise<void> {
    if (!FLAGS.TYPING_INDICATORS_ENABLED) {
      return;
    }

    const chatTyping = this.typing.get(chatId);
    if (chatTyping) {
      const typingUser = chatTyping.get(userId);
      if (typingUser) {
        typingUser.lastActivity = new Date().toISOString();
      }
    }
  }

  async getChatTyping(chatId: string): Promise<TypingUser[]> {
    const chatTyping = this.typing.get(chatId);
    if (!chatTyping) {
      return [];
    }

    const now = Date.now();
    const activeTyping: TypingUser[] = [];

    for (const typingUser of Array.from(chatTyping.values())) {
      const lastActivity = new Date(typingUser.lastActivity).getTime();
      if (now - lastActivity < this.TYPING_TIMEOUT) {
        activeTyping.push(typingUser);
      }
    }

    return activeTyping;
  }

  async isUserTyping(chatId: string, userId: string): Promise<boolean> {
    const chatTyping = this.typing.get(chatId);
    if (!chatTyping) {
      return false;
    }

    const typingUser = chatTyping.get(userId);
    if (!typingUser) {
      return false;
    }

    const now = Date.now();
    const lastActivity = new Date(typingUser.lastActivity).getTime();
    
    return now - lastActivity < this.TYPING_TIMEOUT;
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      
      for (const [chatId, chatTyping] of Array.from(this.typing.entries())) {
        const expiredUsers: string[] = [];
        
        for (const [userId, typingUser] of chatTyping) {
          const lastActivity = new Date(typingUser.lastActivity).getTime();
          if (now - lastActivity >= this.TYPING_TIMEOUT) {
            expiredUsers.push(userId);
          }
        }
        
        for (const userId of expiredUsers) {
          chatTyping.delete(userId);
        }
        
        if (chatTyping.size === 0) {
          this.typing.delete(chatId);
        }
      }
    }, 1000); // Check every second
  }

  getStats() {
    return {
      totalChats: this.typing.size,
      totalTypingUsers: Array.from(this.typing.values()).reduce((sum, chatTyping) => sum + chatTyping.size, 0),
    };
  }

  close(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.typing.clear();
  }
}

// Redis реализация для prod
export class RedisPresenceManager {
  private redis: RedisClientType;
  private isConnected = false;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly TYPING_TIMEOUT = 6000; // 6 seconds

  constructor(config: PresenceConfig['redis']) {
    const redisConfig = {
      socket: {
        host: config?.host || 'localhost',
        port: config?.port || 6379,
      },
      password: config?.password,
    };

    this.redis = createClient(redisConfig);
    this.setupRedis();
    this.startCleanup();
  }

  private async setupRedis(): Promise<void> {
    await this.redis.connect();
    this.isConnected = true;

    this.redis.on('error', (error) => {
      console.error('Redis presence error:', error);
      this.isConnected = false;
    });
  }

  private getTypingKey(chatId: string, userId: string): string {
    return `rt:typing:${chatId}:${userId}`;
  }

  private getChatTypingPattern(chatId: string): string {
    return `rt:typing:${chatId}:*`;
  }

  async startTyping(chatId: string, userId: string): Promise<void> {
    if (!FLAGS.TYPING_INDICATORS_ENABLED) {
      return;
    }

    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    const key = this.getTypingKey(chatId, userId);
    const now = new Date().toISOString();
    const typingData = {
      userId,
      startedAt: now,
      lastActivity: now,
    };

    await this.redis.set(key, JSON.stringify(typingData));
    await this.redis.expire(key, Math.ceil(this.TYPING_TIMEOUT / 1000)); // TTL in seconds
  }

  async stopTyping(chatId: string, userId: string): Promise<void> {
    if (!FLAGS.TYPING_INDICATORS_ENABLED) {
      return;
    }

    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    const key = this.getTypingKey(chatId, userId);
    await this.redis.del(key);
  }

  async updateTypingActivity(chatId: string, userId: string): Promise<void> {
    if (!FLAGS.TYPING_INDICATORS_ENABLED) {
      return;
    }

    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    const key = this.getTypingKey(chatId, userId);
    const existing = await this.redis.get(key);
    
    if (existing) {
      const typingData = JSON.parse(existing);
      typingData.lastActivity = new Date().toISOString();
      
      await this.redis.set(key, JSON.stringify(typingData));
      await this.redis.expire(key, Math.ceil(this.TYPING_TIMEOUT / 1000));
    }
  }

  async getChatTyping(chatId: string): Promise<TypingUser[]> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    const pattern = this.getChatTypingPattern(chatId);
    const keys = await this.redis.keys(pattern);
    const activeTyping: TypingUser[] = [];

    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        try {
          const typingUser = JSON.parse(data) as TypingUser;
          const now = Date.now();
          const lastActivity = new Date(typingUser.lastActivity).getTime();
          
          if (now - lastActivity < this.TYPING_TIMEOUT) {
            activeTyping.push(typingUser);
          }
        } catch (error) {
          console.error('Error parsing typing data:', error);
        }
      }
    }

    return activeTyping;
  }

  async isUserTyping(chatId: string, userId: string): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    const key = this.getTypingKey(chatId, userId);
    const data = await this.redis.get(key);
    
    if (!data) {
      return false;
    }

    try {
      const typingUser = JSON.parse(data) as TypingUser;
      const now = Date.now();
      const lastActivity = new Date(typingUser.lastActivity).getTime();
      
      return now - lastActivity < this.TYPING_TIMEOUT;
    } catch (error) {
      console.error('Error parsing typing data:', error);
      return false;
    }
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(async () => {
      if (!this.isConnected) {
        return;
      }

      try {
        // Redis автоматически удаляет ключи по TTL, но можно добавить дополнительную очистку
        const pattern = 'rt:typing:*';
        const keys = await this.redis.keys(pattern);
        
        for (const key of keys) {
          const data = await this.redis.get(key);
          if (data) {
            try {
              const typingUser = JSON.parse(data) as TypingUser;
              const now = Date.now();
              const lastActivity = new Date(typingUser.lastActivity).getTime();
              
              if (now - lastActivity >= this.TYPING_TIMEOUT) {
                await this.redis.del(key);
              }
            } catch (error) {
              // Удаляем поврежденные данные
              await this.redis.del(key);
            }
          }
        }
      } catch (error) {
        console.error('Error during presence cleanup:', error);
      }
    }, 5000); // Check every 5 seconds
  }

  async close(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.isConnected = false;
    await this.redis.quit();
  }

  getStats() {
    return {
      isConnected: this.isConnected,
    };
  }
}

// Фабрика для создания PresenceManager
export function createPresenceManager(config: PresenceConfig = {}): InMemoryPresenceManager | RedisPresenceManager {
  if (config.useRedis && config.redis) {
    return new RedisPresenceManager(config.redis);
  } else {
    return new InMemoryPresenceManager();
  }
}

// Утилиты для работы с presence
export function formatTypingMessage(typingUsers: TypingUser[], currentUserId: string): string {
  const otherUsers = typingUsers.filter(user => user.userId !== currentUserId);
  
  if (otherUsers.length === 0) {
    return '';
  }
  
  if (otherUsers.length === 1) {
    return `${otherUsers[0].userId} печатает...`;
  }
  
  if (otherUsers.length === 2) {
    return `${otherUsers[0].userId} и ${otherUsers[1].userId} печатают...`;
  }
  
  return `${otherUsers.length} пользователей печатают...`;
}

export function getTypingDuration(typingUser: TypingUser): number {
  const started = new Date(typingUser.startedAt).getTime();
  const now = Date.now();
  return now - started;
}
