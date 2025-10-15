import { EventEmitter } from 'events';
import { 
  RealtimeClientConfig, 
  ConnectionState, 
  RealtimeEventType, 
  ClientCmd,
  WireEnvelopeSchema
} from './types';
import { ExponentialBackoff } from './backoff';
import { OfflineQueue } from './offline-queue';
import { BackfillService } from './backfill';

/**
 * Real-time client with WebSocket and SSE fallback
 */
export class RealtimeClient extends EventEmitter {
  private config: Required<RealtimeClientConfig>;
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private ws: WebSocket | null = null;
  private sse: EventSource | null = null;
  private backoff: ExponentialBackoff;
  private offlineQueue: OfflineQueue;
  private backfillService: BackfillService;
  private subscriptions: Set<string> = new Set();
  private lastConnectedAt: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isDestroyed = false;

  constructor(config: RealtimeClientConfig) {
    super();
    
    this.config = {
      wsPath: '/api/realtime/ws',
      ssePath: '/api/realtime/sse',
      reconnectInterval: 1000,
      maxReconnectAttempts: 10,
      backfillLimit: 50,
      enableSSE: true,
      enableOfflineQueue: true,
      ...config,
    };

    this.backoff = new ExponentialBackoff({
      baseDelay: this.config.reconnectInterval,
      maxAttempts: this.config.maxReconnectAttempts,
    });

    this.offlineQueue = new OfflineQueue(100, 'realtime-offline-queue');
    this.backfillService = new BackfillService(
      this.config.baseUrl,
      this.config.token,
      this.config.backfillLimit
    );

    // Handle page visibility changes
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.state === ConnectionState.DISCONNECTED) {
          this.connect();
        }
      });
    }
  }

  /**
   * Connect to the real-time service
   */
  async connect(): Promise<void> {
    if (this.isDestroyed) {
      throw new Error('Client has been destroyed');
    }

    if (this.state === ConnectionState.CONNECTED || this.state === ConnectionState.CONNECTING) {
      return;
    }

    this.setState(ConnectionState.CONNECTING);

    try {
      // Try WebSocket first
      await this.connectWebSocket();
    } catch (wsError) {
      console.warn('WebSocket connection failed, trying SSE:', wsError);
      
      if (this.config.enableSSE) {
        try {
          await this.connectSSE();
        } catch (sseError) {
          console.error('Both WebSocket and SSE failed:', sseError);
          this.handleConnectionFailure();
        }
      } else {
        this.handleConnectionFailure();
      }
    }
  }

  /**
   * Disconnect from the real-time service
   */
  disconnect(): void {
    this.clearTimers();
    this.closeConnections();
    this.setState(ConnectionState.DISCONNECTED);
  }

  /**
   * Destroy the client and clean up resources
   */
  destroy(): void {
    this.isDestroyed = true;
    this.disconnect();
    this.removeAllListeners();
    this.offlineQueue.clear();
  }

  /**
   * Subscribe to rooms
   */
  async subscribe(rooms: string[]): Promise<void> {
    for (const room of rooms) {
      this.subscriptions.add(room);
    }

    if (this.state === ConnectionState.CONNECTED) {
      await this.sendCommand({ op: 'subscribe', rooms });
    }
  }

  /**
   * Unsubscribe from rooms
   */
  async unsubscribe(rooms: string[]): Promise<void> {
    for (const room of rooms) {
      this.subscriptions.delete(room);
    }

    if (this.state === ConnectionState.CONNECTED) {
      await this.sendCommand({ op: 'unsubscribe', rooms });
    }
  }

  /**
   * Send typing indicator
   */
  async sendTyping(chatId: string, action: 'start' | 'stop'): Promise<void> {
    const cmd: ClientCmd = { op: 'typing', chatId, action };
    
    if (this.state === ConnectionState.CONNECTED) {
      await this.sendCommand(cmd);
    } else if (this.config.enableOfflineQueue) {
      this.offlineQueue.add('typing', cmd);
    }
  }

  /**
   * Send acknowledgment
   */
  async sendAck(chatId: string, seq: number, kind: 'delivered' | 'read'): Promise<void> {
    const cmd: ClientCmd = { op: 'ack', chatId, seq, kind };
    
    if (this.state === ConnectionState.CONNECTED) {
      await this.sendCommand(cmd);
    } else if (this.config.enableOfflineQueue) {
      this.offlineQueue.add('ack', cmd);
    }
  }

  /**
   * Send ping
   */
  async ping(): Promise<void> {
    const cmd: ClientCmd = { op: 'ping', ts: Date.now() };
    
    if (this.state === ConnectionState.CONNECTED) {
      await this.sendCommand(cmd);
    }
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Get current subscriptions
   */
  getSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED;
  }

  // Private methods

  private setState(newState: ConnectionState): void {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;
      this.emit('stateChange', newState, oldState);
    }
  }

  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `${this.config.baseUrl.replace(/^http/, 'ws')}${this.config.wsPath}`;
      
      try {
        this.ws = new WebSocket(wsUrl, [this.config.token]);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.lastConnectedAt = Date.now();
          this.setState(ConnectionState.CONNECTED);
          this.backoff.reset();
          this.startHeartbeat();
          this.resubscribe();
          this.processOfflineQueue();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          this.handleDisconnection();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private async connectSSE(): Promise<void> {
    return new Promise((resolve, reject) => {
      const sseUrl = `${this.config.baseUrl}${this.config.ssePath}`;
      
      try {
        this.sse = new EventSource(sseUrl, {
          headers: {
            'Authorization': `Bearer ${this.config.token}`,
          },
        } as EventSourceInit & { headers: Record<string, string> });

        this.sse.onopen = () => {
          console.log('SSE connected');
          this.lastConnectedAt = Date.now();
          this.setState(ConnectionState.CONNECTED);
          this.backoff.reset();
          this.resubscribe();
          this.processOfflineQueue();
          resolve();
        };

        this.sse.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.sse.onerror = (error) => {
          console.error('SSE error:', error);
          this.handleDisconnection();
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(data: string): void {
    try {
      const envelope = WireEnvelopeSchema.parse(JSON.parse(data));
      this.emit('message', envelope);
      this.emit(envelope.type as RealtimeEventType, envelope.data);
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }

  private handleDisconnection(): void {
    this.closeConnections();
    this.clearTimers();
    
    if (!this.isDestroyed) {
      this.setState(ConnectionState.RECONNECTING);
      this.scheduleReconnect();
    }
  }

  private handleConnectionFailure(): void {
    this.closeConnections();
    this.clearTimers();
    this.setState(ConnectionState.FAILED);
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.isDestroyed) return;

    const delay = this.backoff.next();
    if (delay === null) {
      console.error('Max reconnection attempts reached');
      this.setState(ConnectionState.FAILED);
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    console.log(`Reconnecting in ${delay}ms (attempt ${this.backoff.getAttempt()})`);
    this.reconnectTimer = setTimeout(() => {
      if (!this.isDestroyed) {
        this.connect();
      }
    }, delay);
  }

  private async resubscribe(): Promise<void> {
    if (this.subscriptions.size > 0) {
      await this.sendCommand({ 
        op: 'subscribe', 
        rooms: Array.from(this.subscriptions) 
      });
    }
  }

  private async processOfflineQueue(): Promise<void> {
    if (!this.config.enableOfflineQueue) return;

    const messages = this.offlineQueue.getAll();
    for (const message of messages) {
      try {
        await this.sendCommand(message.payload as ClientCmd);
        this.offlineQueue.remove(message.id);
      } catch (error) {
        console.error('Failed to process offline message:', error);
        this.offlineQueue.incrementRetry(message.id);
      }
    }
  }

  private async sendCommand(cmd: ClientCmd): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Not connected');
    }

    const message = JSON.stringify(cmd);
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else if (this.sse) {
      // For SSE, we need to send commands via HTTP POST
      // This is a simplified implementation
      await fetch(`${this.config.baseUrl}/api/realtime/command`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
        },
        body: message,
      });
    } else {
      throw new Error('No active connection');
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.ping();
      }
    }, 30000); // Ping every 30 seconds
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private closeConnections(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.sse) {
      this.sse.close();
      this.sse = null;
    }
  }
}
