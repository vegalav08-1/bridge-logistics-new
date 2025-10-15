import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { EventBus, createEventBus, createChatRoom, createUserRoom } from './bus';
import { WireEnvelope, validateWireEnvelope, createWireEnvelope, EventType } from './events';
import { FLAGS } from '@yp/shared';

export interface RealtimeServerConfig {
  port: number;
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  useRedis?: boolean;
  jwtSecret: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

export interface ClientCommand {
  op: 'subscribe' | 'unsubscribe' | 'typing' | 'ack' | 'ping';
  rooms?: string[];
  chatId?: string;
  action?: 'start' | 'stop';
  seq?: number;
  kind?: 'delivered' | 'read';
  ts?: number;
}

export interface RealtimeConnection {
  ws: WebSocket;
  user: AuthenticatedUser;
  subscribedRooms: Set<string>;
  lastPing: number;
  isAlive: boolean;
}

export class RealtimeServer {
  private wss: WebSocketServer;
  private eventBus: EventBus;
  private connections = new Map<string, RealtimeConnection>();
  private rateLimits = new Map<string, { count: number; resetTime: number }>();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(private config: RealtimeServerConfig) {
    this.eventBus = createEventBus({
      useRedis: config.useRedis,
      redis: config.redis,
    });

    this.wss = new WebSocketServer({
      port: config.port,
      verifyClient: this.verifyClient.bind(this),
    });

    this.setupWebSocketServer();
    this.startHeartbeat();
  }

  private async verifyClient(info: { origin: string; secure: boolean; req: IncomingMessage }): Promise<boolean> {
    try {
      const token = this.extractToken(info.req);
      if (!token) {
        return false;
      }

      const user = await this.authenticateUser(token);
      if (!user) {
        return false;
      }

      // Сохраняем пользователя в запросе для использования в connection
      (info.req as any).user = user;
      return true;
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      return false;
    }
  }

  private extractToken(req: IncomingMessage): string | null {
    // Проверяем Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Проверяем Sec-WebSocket-Protocol
    const protocols = req.headers['sec-websocket-protocol'];
    if (protocols) {
      const protocolList = protocols.split(',').map(p => p.trim());
      const tokenProtocol = protocolList.find(p => p.startsWith('token.'));
      if (tokenProtocol) {
        return tokenProtocol.substring(6);
      }
    }

    return null;
  }

  private async authenticateUser(token: string): Promise<AuthenticatedUser | null> {
    try {
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
      console.error('Token verification failed:', error);
      return null;
    }
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const user = (req as any).user as AuthenticatedUser;
      if (!user) {
        ws.close(1008, 'Authentication failed');
        return;
      }

      const connectionId = this.generateConnectionId();
      const connection: RealtimeConnection = {
        ws,
        user,
        subscribedRooms: new Set(),
        lastPing: Date.now(),
        isAlive: true,
      };

      this.connections.set(connectionId, connection);

      // Автоматически подписываем на user room
      this.subscribeToRoom(connectionId, createUserRoom(user.id));

      console.log(`WebSocket connected: ${user.email} (${connectionId})`);

      ws.on('message', (data: Buffer) => {
        this.handleMessage(connectionId, data);
      });

      ws.on('close', () => {
        this.handleDisconnect(connectionId);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for ${user.email}:`, error);
        this.handleDisconnect(connectionId);
      });

      ws.on('pong', () => {
        const connection = this.connections.get(connectionId);
        if (connection) {
          connection.isAlive = true;
          connection.lastPing = Date.now();
        }
      });
    });
  }

  private async handleMessage(connectionId: string, data: Buffer): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    try {
      const command: ClientCommand = JSON.parse(data.toString());
      await this.processCommand(connectionId, command);
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      this.sendError(connection, 'Invalid message format');
    }
  }

  private async processCommand(connectionId: string, command: ClientCommand): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    // Rate limiting
    if (!this.checkRateLimit(connectionId, command.op)) {
      this.sendError(connection, 'Rate limit exceeded');
      return;
    }

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
      case 'ping':
        this.handlePing(connectionId, command.ts!);
        break;
      default:
        this.sendError(connection, 'Unknown command');
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
          this.sendError(connection, `Access denied to chat ${chatId}`);
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
      this.sendError(connection, `Access denied to chat ${chatId}`);
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

    await this.eventBus.publish(createChatRoom(chatId), envelope);
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
      this.sendError(connection, `Access denied to chat ${chatId}`);
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

    await this.eventBus.publish(createChatRoom(chatId), envelope);
  }

  private handlePing(connectionId: string, ts: number): void {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    const pong = createWireEnvelope('pong', null, {});
    this.sendToConnection(connection, pong);
  }

  private async subscribeToRoom(connectionId: string, room: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    connection.subscribedRooms.add(room);
    
    await this.eventBus.subscribe(room, (envelope) => {
      this.sendToConnection(connection, envelope);
    });

    console.log(`Subscribed ${connection.user.email} to ${room}`);
  }

  private async unsubscribeFromRoom(connectionId: string, room: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    connection.subscribedRooms.delete(room);
    
    // В реальной реализации нужно удалить конкретный обработчик
    // Для простоты оставляем как есть
    
    console.log(`Unsubscribed ${connection.user.email} from ${room}`);
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

  private sendToConnection(connection: RealtimeConnection, envelope: WireEnvelope): void {
    if (connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(envelope));
    }
  }

  private sendError(connection: RealtimeConnection, message: string): void {
    const error = createWireEnvelope('error', {
      code: 'CLIENT_ERROR',
      message,
    }, {});
    this.sendToConnection(connection, error);
  }

  private handleDisconnect(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      console.log(`WebSocket disconnected: ${connection.user.email} (${connectionId})`);
      
      // Отписываемся от всех комнат
      for (const room of connection.subscribedRooms) {
        this.unsubscribeFromRoom(connectionId, room);
      }
      
      this.connections.delete(connectionId);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      for (const [connectionId, connection] of this.connections) {
        if (!connection.isAlive) {
          console.log(`Terminating inactive connection: ${connection.user.email}`);
          connection.ws.terminate();
          this.handleDisconnect(connectionId);
          continue;
        }

        connection.isAlive = false;
        connection.ws.ping();
      }
    }, 20000); // 20 seconds
  }

  private generateConnectionId(): string {
    return require('cuid')();
  }

  // Публичные методы для интеграции с API
  async publishToChat(chatId: string, type: EventType, data: any, seq?: number): Promise<void> {
    const envelope = createWireEnvelope(type, data, {
      room: createChatRoom(chatId),
      seq,
    });
    await this.eventBus.publish(createChatRoom(chatId), envelope);
  }

  async publishToUser(userId: string, type: EventType, data: any): Promise<void> {
    const envelope = createWireEnvelope(type, data, {
      room: createUserRoom(userId),
    });
    await this.eventBus.publish(createUserRoom(userId), envelope);
  }

  getStats() {
    return {
      connections: this.connections.size,
      eventBus: { subscribers: 0 }, // TODO: Implement getStats in EventBus
    };
  }

  async close(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Закрываем все соединения
    for (const connection of this.connections.values()) {
      connection.ws.close();
    }

    await this.eventBus.close();
    this.wss.close();
  }
}
