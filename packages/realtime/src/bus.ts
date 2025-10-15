import { EventEmitter } from 'events';
import { createClient, RedisClientType } from 'redis';
import { WireEnvelope, createWireEnvelope, validateWireEnvelope } from './events';

export interface EventBusConfig {
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  useRedis?: boolean;
}

export interface EventBus {
  publish(room: string, envelope: WireEnvelope): Promise<void>;
  subscribe(room: string, handler: (envelope: WireEnvelope) => void): Promise<void>;
  unsubscribe(room: string, handler: (envelope: WireEnvelope) => void): Promise<void>;
  close(): Promise<void>;
}

// In-memory реализация для dev
export class InMemoryEventBus extends EventEmitter implements EventBus {
  private rooms = new Map<string, Set<(envelope: WireEnvelope) => void>>();

  async publish(room: string, envelope: WireEnvelope): Promise<void> {
    const handlers = this.rooms.get(room);
    if (handlers) {
      // Асинхронно вызываем все обработчики
      const promises = Array.from(handlers).map(handler => 
        Promise.resolve().then(() => handler(envelope))
      );
      await Promise.all(promises);
    }
  }

  async subscribe(room: string, handler: (envelope: WireEnvelope) => void): Promise<void> {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room)!.add(handler);
  }

  async unsubscribe(room: string, handler: (envelope: WireEnvelope) => void): Promise<void> {
    const handlers = this.rooms.get(room);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.rooms.delete(room);
      }
    }
  }

  async close(): Promise<void> {
    this.rooms.clear();
    this.removeAllListeners();
  }

  // Метрики для отладки
  getStats() {
    return {
      totalRooms: this.rooms.size,
      totalSubscribers: Array.from(this.rooms.values()).reduce((sum, handlers) => sum + handlers.size, 0),
    };
  }
}

// Redis Pub/Sub реализация для prod
export class RedisEventBus implements EventBus {
  private publisher: RedisClientType;
  private subscriber: RedisClientType;
  private handlers = new Map<string, Set<(envelope: WireEnvelope) => void>>();
  private isConnected = false;

  constructor(config: EventBusConfig['redis']) {
    const redisConfig = {
      socket: {
        host: config?.host || 'localhost',
        port: config?.port || 6379,
      },
      password: config?.password,
    };

    this.publisher = createClient(redisConfig);
    this.subscriber = createClient(redisConfig);

    this.setupSubscriber();
  }

  private async setupSubscriber(): Promise<void> {
    await this.subscriber.connect();
    this.isConnected = true;

    this.subscriber.on('message', (channel: string, message: string) => {
      try {
        const envelope = validateWireEnvelope(JSON.parse(message));
        if (envelope) {
          const handlers = this.handlers.get(channel);
          if (handlers) {
            handlers.forEach(handler => {
              try {
                handler(envelope);
              } catch (error) {
                console.error('Error in event handler:', error);
              }
            });
          }
        }
      } catch (error) {
        console.error('Error parsing Redis message:', error);
      }
    });

    this.subscriber.on('error', (error) => {
      console.error('Redis subscriber error:', error);
      this.isConnected = false;
    });

    this.publisher.on('error', (error) => {
      console.error('Redis publisher error:', error);
    });
  }

  async publish(room: string, envelope: WireEnvelope): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    const channel = `rt:${room}`;
    const message = JSON.stringify(envelope);
    
    await this.publisher.publish(channel, message);
  }

  async subscribe(room: string, handler: (envelope: WireEnvelope) => void): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    const channel = `rt:${room}`;
    
    // Добавляем обработчик
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
    }
    this.handlers.get(channel)!.add(handler);

    // Подписываемся на канал Redis
    await this.subscriber.subscribe(channel, (message) => {
      // Обработка уже происходит в setupSubscriber
    });
  }

  async unsubscribe(room: string, handler: (envelope: WireEnvelope) => void): Promise<void> {
    const channel = `rt:${room}`;
    const handlers = this.handlers.get(channel);
    
    if (handlers) {
      handlers.delete(handler);
      
      if (handlers.size === 0) {
        this.handlers.delete(channel);
        await this.subscriber.unsubscribe(channel);
      }
    }
  }

  async close(): Promise<void> {
    this.isConnected = false;
    this.handlers.clear();
    
    await Promise.all([
      this.publisher.quit(),
      this.subscriber.quit(),
    ]);
  }

  // Метрики
  getStats() {
    return {
      isConnected: this.isConnected,
      totalRooms: this.handlers.size,
      totalSubscribers: Array.from(this.handlers.values()).reduce((sum, handlers) => sum + handlers.size, 0),
    };
  }
}

// Фабрика для создания EventBus
export function createEventBus(config: EventBusConfig = {}): EventBus {
  if (config.useRedis && config.redis) {
    return new RedisEventBus(config.redis);
  } else {
    return new InMemoryEventBus();
  }
}

// Утилиты для работы с комнатами
export function createChatRoom(chatId: string): string {
  return `chat:${chatId}`;
}

export function createUserRoom(userId: string): string {
  return `user:${userId}`;
}

export function parseRoom(room: string): { type: 'chat' | 'user'; id: string } | null {
  const match = room.match(/^(chat|user):(.+)$/);
  if (match) {
    return {
      type: match[1] as 'chat' | 'user',
      id: match[2],
    };
  }
  return null;
}




