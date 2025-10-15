import { IncomingMessage, ServerResponse } from 'http';
import { EventBus, createEventBus, createChatRoom, createUserRoom } from './bus';
import { WireEnvelope, createWireEnvelope, EventType } from './events';
import { FLAGS } from '@yp/shared';

export interface SSEServerConfig {
  eventBus: EventBus;
  jwtSecret: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

export interface SSEClientCommand {
  op: 'subscribe' | 'unsubscribe' | 'typing' | 'ack';
  rooms?: string[];
  chatId?: string;
  action?: 'start' | 'stop';
  seq?: number;
  kind?: 'delivered' | 'read';
}

export interface SSEConnection {
  res: ServerResponse;
  user: AuthenticatedUser;
  subscribedRooms: Set<string>;
  lastActivity: number;
  isAlive: boolean;
}

export class SSEServer {
  private connections = new Map<string, SSEConnection>();
  private rateLimits = new Map<string, { count: number; resetTime: number }>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private config: SSEServerConfig) {
    this.startCleanup();
  }

  async handleSSEConnection(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const user = await this.authenticateUser(req);
      if (!user) {
        res.writeHead(401, { 'Content-Type': 'text/plain' });
        res.end('Unauthorized');
        return;
      }

      const connectionId = this.generateConnectionId();
      const connection: SSEConnection = {
        res,
        user,
        subscribedRooms: new Set(),
        lastActivity: Date.now(),
        isAlive: true,
      };

      this.connections.set(connectionId, connection);

      // Настраиваем SSE заголовки
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      });

      // Отправляем initial event
      this.sendSSEEvent(res, 'connected', { connectionId });

      // Автоматически подписываем на user room
      await this.subscribeToRoom(connectionId, createUserRoom(user.id));

      console.log(`SSE connected: ${user.email} (${connectionId})`);

      // Обрабатываем команды через POST запросы
      req.on('data', (data: Buffer) => {
        this.handleCommand(connectionId, data);
      });

      req.on('close', () => {
        this.handleDisconnect(connectionId);
      });

      req.on('error', (error) => {
        console.error(`SSE error for ${user.email}:`, error);
        this.handleDisconnect(connectionId);
      });

    } catch (error) {
      console.error('SSE connection error:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  }

  private async authenticateUser(req: IncomingMessage): Promise<AuthenticatedUser | null> {
    try {
      const token = this.extractToken(req);
      if (!token) {
        return null;
      }

      // Динамический импорт для избежания циклических зависимостей
      // TODO: Implement proper JWT verification
      // const { verifyAccessToken } = await import('@yp/api/auth/tokens');
      // Mock JWT verification for now
      const payload = { userId: 'mock-user', email: 'mock@example.com', role: 'USER' };
      
      if (!payload) {
        return null;
      }

      return {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      console.error('SSE token verification failed:', error);
      return null;
    }
  }

  private extractToken(req: IncomingMessage): string | null {
    // Проверяем Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Проверяем query параметр
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    return url.searchParams.get('token');
  }

  private async handleCommand(connectionId: string, data: Buffer): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    try {
      const command: SSEClientCommand = JSON.parse(data.toString());
      await this.processCommand(connectionId, command);
    } catch (error) {
      console.error('Error processing SSE command:', error);
      this.sendSSEEvent(connection.res, 'error', { message: 'Invalid command format' });
    }
  }

  private async processCommand(connectionId: string, command: SSEClientCommand): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    // Rate limiting
    if (!this.checkRateLimit(connectionId, command.op)) {
      this.sendSSEEvent(connection.res, 'error', { message: 'Rate limit exceeded' });
      return;
    }

    connection.lastActivity = Date.now();

    switch (command.op) {
      case 'subscribe':
        await this.handleSubscribe(connectionId, command.rooms || []);
        break;
      case 'unsubscribe':
        await this.handleUnsubscribe(connectionId, command.rooms || []);
        break;
      case 'typing':
        await this.handleTyping(connectionId, command.chatId!, command.action!);
        break;
      case 'ack':
        await this.handleAck(connectionId, command.chatId!, command.seq!, command.kind!);
        break;
      default:
        this.sendSSEEvent(connection.res, 'error', { message: 'Unknown command' });
    }
  }

  private async handleSubscribe(connectionId: string, rooms: string[]): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    for (const room of rooms) {
      // Проверяем RBAC для подписки на чат
      if (room.startsWith('chat:')) {
        const chatId = room.substring(5);
        const hasAccess = await this.checkChatAccess(connection.user.id, chatId);
        if (!hasAccess) {
          this.sendSSEEvent(connection.res, 'error', { message: `Access denied to chat ${chatId}` });
          continue;
        }
      }

      await this.subscribeToRoom(connectionId, room);
    }
  }

  private async handleUnsubscribe(connectionId: string, rooms: string[]): Promise<void> {
    for (const room of rooms) {
      await this.unsubscribeFromRoom(connectionId, room);
    }
  }

  private async handleTyping(connectionId: string, chatId: string, action: 'start' | 'stop'): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    if (!FLAGS.TYPING_INDICATORS_ENABLED) {
      return;
    }

    // Проверяем доступ к чату
    const hasAccess = await this.checkChatAccess(connection.user.id, chatId);
    if (!hasAccess) {
      this.sendSSEEvent(connection.res, 'error', { message: `Access denied to chat ${chatId}` });
      return;
    }

    const eventType: EventType = action === 'start' ? 'typing.start' : 'typing.stop';
    const envelope = createWireEnvelope(eventType, {
      chatId,
      userId: connection.user.id,
      at: new Date().toISOString(),
    }, {
      room: createChatRoom(chatId),
    });

    await this.config.eventBus.publish(createChatRoom(chatId), envelope);
  }

  private async handleAck(connectionId: string, chatId: string, seq: number, kind: 'delivered' | 'read'): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    if (!FLAGS.DELIVERED_RECEIPTS_ENABLED && kind === 'delivered') {
      return;
    }

    if (!FLAGS.READ_RECEIPTS_ENABLED && kind === 'read') {
      return;
    }

    // Проверяем доступ к чату
    const hasAccess = await this.checkChatAccess(connection.user.id, chatId);
    if (!hasAccess) {
      this.sendSSEEvent(connection.res, 'error', { message: `Access denied to chat ${chatId}` });
      return;
    }

    const eventType: EventType = kind === 'delivered' ? 'receipt.delivered' : 'receipt.read';
    const envelope = createWireEnvelope(eventType, {
      chatId,
      messageSeq: kind === 'delivered' ? seq : undefined,
      maxReadSeq: kind === 'read' ? seq : undefined,
      userId: connection.user.id,
      at: new Date().toISOString(),
    }, {
      room: createChatRoom(chatId),
    });

    await this.config.eventBus.publish(createChatRoom(chatId), envelope);
  }

  private async subscribeToRoom(connectionId: string, room: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    connection.subscribedRooms.add(room);
    
    await this.config.eventBus.subscribe(room, (envelope) => {
      this.sendSSEEvent(connection.res, 'event', envelope);
    });

    console.log(`SSE subscribed ${connection.user.email} to ${room}`);
  }

  private async unsubscribeFromRoom(connectionId: string, room: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    connection.subscribedRooms.delete(room);
    
    console.log(`SSE unsubscribed ${connection.user.email} from ${room}`);
  }

  private async checkChatAccess(userId: string, chatId: string): Promise<boolean> {
    try {
      // Динамический импорт для избежания циклических зависимостей
      // TODO: Implement proper RBAC and DB checks
      // const { canAccessChat } = await import('@yp/api/chat/rbac');
      // const { db } = await import('@yp/db');
      
      // Mock chat access check for now
      // const chat = await db.chat.findUnique({
      //   where: { id: chatId },
      // });
      return true; // Allow access for now
    } catch (error) {
      console.error('Error checking chat access:', error);
      return false;
    }
  }

  private checkRateLimit(connectionId: string, operation: string): boolean {
    const now = Date.now();
    const key = `${connectionId}:${operation}`;
    const limit = this.rateLimits.get(key);

    if (!limit || now > limit.resetTime) {
      this.rateLimits.set(key, {
        count: 1,
        resetTime: now + 60000, // 1 minute
      });
      return true;
    }

    if (limit.count >= this.getRateLimitForOperation(operation)) {
      return false;
    }

    limit.count++;
    return true;
  }

  private getRateLimitForOperation(operation: string): number {
    switch (operation) {
      case 'typing':
        return 2; // 2 per second
      case 'subscribe':
      case 'unsubscribe':
        return 10; // 10 per minute
      case 'ack':
        return 100; // 100 per minute
      default:
        return 100; // 100 per minute
    }
  }

  private sendSSEEvent(res: ServerResponse, event: string, data: any): void {
    if (res.destroyed) {
      return;
    }

    const eventData = JSON.stringify(data);
    res.write(`event: ${event}\n`);
    res.write(`data: ${eventData}\n\n`);
  }

  private handleDisconnect(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      console.log(`SSE disconnected: ${connection.user.email} (${connectionId})`);
      
      // Отписываемся от всех комнат
      for (const room of connection.subscribedRooms) {
        this.unsubscribeFromRoom(connectionId, room);
      }
      
      this.connections.delete(connectionId);
    }
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 2 * 60 * 1000; // 2 minutes

      for (const [connectionId, connection] of this.connections) {
        if (now - connection.lastActivity > timeout) {
          console.log(`Cleaning up inactive SSE connection: ${connection.user.email}`);
          this.handleDisconnect(connectionId);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  private generateConnectionId(): string {
    return require('cuid')();
  }

  getStats() {
    return {
      connections: this.connections.size,
    };
  }

  close(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Закрываем все соединения
    for (const connection of this.connections.values()) {
      if (!connection.res.destroyed) {
        connection.res.end();
      }
    }

    this.connections.clear();
  }
}
