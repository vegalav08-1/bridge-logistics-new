import { OfflineMessage } from './types';

/**
 * Offline queue for storing messages when connection is down
 */
export class OfflineQueue {
  private queue: OfflineMessage[] = [];
  private maxSize: number;
  private storageKey: string;

  constructor(maxSize = 100, storageKey = 'realtime-offline-queue') {
    this.maxSize = maxSize;
    this.storageKey = storageKey;
    this.loadFromStorage();
  }

  /**
   * Add a message to the offline queue
   */
  add(type: OfflineMessage['type'], payload: unknown): string {
    const message: OfflineMessage = {
      id: this.generateId(),
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(message);
    this.trimQueue();
    this.saveToStorage();
    
    return message.id;
  }

  /**
   * Get all messages from the queue
   */
  getAll(): OfflineMessage[] {
    return [...this.queue];
  }

  /**
   * Remove a message from the queue
   */
  remove(id: string): boolean {
    const index = this.queue.findIndex(msg => msg.id === id);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Increment retry count for a message
   */
  incrementRetry(id: string): boolean {
    const message = this.queue.find(msg => msg.id === id);
    if (message) {
      message.retryCount++;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Clear all messages from the queue
   */
  clear(): void {
    this.queue = [];
    this.saveToStorage();
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Trim queue to max size, removing oldest messages
   */
  private trimQueue(): void {
    if (this.queue.length > this.maxSize) {
      this.queue = this.queue.slice(-this.maxSize);
    }
  }

  /**
   * Generate unique ID for message
   */
  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Load queue from localStorage
   */
  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(this.storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            this.queue = parsed;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load offline queue from storage:', error);
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
      }
    } catch (error) {
      console.warn('Failed to save offline queue to storage:', error);
    }
  }
}




