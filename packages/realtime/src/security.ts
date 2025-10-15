// prisma will be imported dynamically to avoid circular dependencies
// UserRole will be imported dynamically to avoid circular dependencies
import { metrics } from './metrics';

/**
 * Security and validation for real-time communication
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Don't count successful requests
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);
    
    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }
    
    if (entry.count >= this.config.maxRequests) {
      return false;
    }
    
    entry.count++;
    return true;
  }

  getRemainingRequests(key: string): number {
    const entry = this.limits.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return this.config.maxRequests;
    }
    return Math.max(0, this.config.maxRequests - entry.count);
  }

  getResetTime(key: string): number {
    const entry = this.limits.get(key);
    return entry ? entry.resetTime : Date.now() + this.config.windowMs;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of Array.from(this.limits.entries())) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Rate limiters for different operations
const rateLimiters = {
  // General commands (subscribe, unsubscribe, ping)
  commands: new RateLimiter({ windowMs: 60000, maxRequests: 60 }), // 60 per minute
  
  // Typing indicators (more frequent)
  typing: new RateLimiter({ windowMs: 10000, maxRequests: 20 }), // 20 per 10 seconds
  
  // Acknowledgments (less frequent)
  acks: new RateLimiter({ windowMs: 60000, maxRequests: 30 }), // 30 per minute
  
  // Connection attempts
  connections: new RateLimiter({ windowMs: 300000, maxRequests: 10 }), // 10 per 5 minutes
};

/**
 * Check if user can subscribe to a room
 */
export async function canSubscribeToRoom(userId: string, userRole: string, room: string): Promise<boolean> {
  try {
    if (userRole === 'SUPER_ADMIN') {
      return true; // Super admin can subscribe to any room
    }

    if (room.startsWith('user:')) {
      const targetUserId = room.split(':')[1];
      return targetUserId === userId; // Users can only subscribe to their own user room
    }

    if (room.startsWith('chat:')) {
      const chatId = room.split(':')[1];
      
      // Check if user is a participant of the chat
      const { prisma } = await import('@yp/db');
      const isParticipant = await prisma.chatMember.findUnique({
        where: {
          chatId_userId: {
            chatId,
            userId,
          },
        },
      });

      return !!isParticipant;
    }

    return false; // Unknown room type
  } catch (error) {
    console.error('Error checking room subscription permission:', error);
    metrics.recordError('rbac_check_failed', error as Error);
    return false;
  }
}

/**
 * Check if user can publish events to a room
 */
export async function canPublishToRoom(userId: string, userRole: string, room: string): Promise<boolean> {
  try {
    if (userRole === 'SUPER_ADMIN') {
      return true; // Super admin can publish to any room
    }

    if (room.startsWith('user:')) {
      const targetUserId = room.split(':')[1];
      return targetUserId === userId; // Users can only publish to their own user room
    }

    if (room.startsWith('chat:')) {
      const chatId = room.split(':')[1];
      
      // Check if user is a participant of the chat
      const { prisma } = await import('@yp/db');
      const isParticipant = await prisma.chatMember.findUnique({
        where: {
          chatId_userId: {
            chatId,
            userId,
          },
        },
      });

      return !!isParticipant;
    }

    return false; // Unknown room type
  } catch (error) {
    console.error('Error checking room publish permission:', error);
    metrics.recordError('rbac_check_failed', error as Error);
    return false;
  }
}

/**
 * Validate and rate limit a command
 */
export function validateCommand(
  userId: string,
  command: string,
  room?: string
): { allowed: boolean; reason?: string; remainingRequests?: number } {
  try {
    // Rate limiting based on command type
    let rateLimiter: RateLimiter;
    let rateLimitKey: string;

    switch (command) {
      case 'subscribe':
      case 'unsubscribe':
      case 'ping':
        rateLimiter = rateLimiters.commands;
        rateLimitKey = `commands:${userId}`;
        break;
      case 'typing':
        rateLimiter = rateLimiters.typing;
        rateLimitKey = `typing:${userId}`;
        break;
      case 'ack':
        rateLimiter = rateLimiters.acks;
        rateLimitKey = `acks:${userId}`;
        break;
      default:
        return { allowed: false, reason: 'Unknown command' };
    }

    if (!rateLimiter.isAllowed(rateLimitKey)) {
      const remaining = rateLimiter.getRemainingRequests(rateLimitKey);
      const resetTime = rateLimiter.getResetTime(rateLimitKey);
      return {
        allowed: false,
        reason: `Rate limit exceeded. Try again in ${Math.ceil((resetTime - Date.now()) / 1000)} seconds`,
        remainingRequests: remaining,
      };
    }

    return { allowed: true, remainingRequests: rateLimiter.getRemainingRequests(rateLimitKey) };
  } catch (error) {
    console.error('Error validating command:', error);
    metrics.recordError('command_validation_failed', error as Error);
    return { allowed: false, reason: 'Validation error' };
  }
}

/**
 * Validate connection attempt
 */
export function validateConnection(userId: string, userAgent?: string, ip?: string): { allowed: boolean; reason?: string } {
  try {
    const rateLimitKey = `connection:${userId}:${ip || 'unknown'}`;
    
    if (!rateLimiters.connections.isAllowed(rateLimitKey)) {
      const resetTime = rateLimiters.connections.getResetTime(rateLimitKey);
      return {
        allowed: false,
        reason: `Too many connection attempts. Try again in ${Math.ceil((resetTime - Date.now()) / 1000)} seconds`,
      };
    }

    // Additional validation can be added here
    // e.g., check for suspicious user agents, IP blacklists, etc.

    return { allowed: true };
  } catch (error) {
    console.error('Error validating connection:', error);
    metrics.recordError('connection_validation_failed', error as Error);
    return { allowed: false, reason: 'Validation error' };
  }
}

/**
 * Sanitize room name to prevent injection attacks
 */
export function sanitizeRoomName(room: string): string | null {
  // Only allow alphanumeric characters, underscores, and colons
  const sanitized = room.replace(/[^a-zA-Z0-9_:]/g, '');
  
  // Must start with a valid prefix
  if (!sanitized.match(/^(user|chat):[a-zA-Z0-9_]+$/)) {
    return null;
  }
  
  return sanitized;
}

/**
 * Validate message payload size
 */
export function validateMessageSize(payload: string, maxSizeBytes = 1024 * 1024): { valid: boolean; reason?: string } {
  const size = new TextEncoder().encode(payload).length;
  
  if (size > maxSizeBytes) {
    return {
      valid: false,
      reason: `Message too large: ${size} bytes (max: ${maxSizeBytes} bytes)`,
    };
  }
  
  return { valid: true };
}

/**
 * Check for suspicious patterns in messages
 */
export function detectSuspiciousActivity(userId: string, command: string, payload: any): { suspicious: boolean; reason?: string } {
  try {
    // Check for rapid repeated commands
    const commandKey = `suspicious:${userId}:${command}`;
    const now = Date.now();
    
    // This is a simplified check - in production, you'd want more sophisticated detection
    const recentCommands = getRecentCommands(userId, command, 10000); // Last 10 seconds
    
    if (recentCommands.length > 10) {
      return {
        suspicious: true,
        reason: 'Too many rapid commands',
      };
    }
    
    // Check for unusual payload patterns
    if (typeof payload === 'string' && payload.length > 10000) {
      return {
        suspicious: true,
        reason: 'Unusually large payload',
      };
    }
    
    return { suspicious: false };
  } catch (error) {
    console.error('Error detecting suspicious activity:', error);
    return { suspicious: false };
  }
}

// Simple in-memory store for recent commands (in production, use Redis)
const recentCommands = new Map<string, number[]>();

function getRecentCommands(userId: string, command: string, windowMs: number): number[] {
  const key = `${userId}:${command}`;
  const now = Date.now();
  const commands = recentCommands.get(key) || [];
  
  // Filter to recent commands
  const recent = commands.filter(timestamp => now - timestamp < windowMs);
  recentCommands.set(key, recent);
  
  return recent;
}

function recordCommand(userId: string, command: string): void {
  const key = `${userId}:${command}`;
  const now = Date.now();
  const commands = recentCommands.get(key) || [];
  commands.push(now);
  recentCommands.set(key, commands);
}

/**
 * Security middleware for WebSocket connections
 */
export function createSecurityMiddleware() {
  return {
    validateConnection,
    validateCommand,
    canSubscribeToRoom,
    canPublishToRoom,
    sanitizeRoomName,
    validateMessageSize,
    detectSuspiciousActivity,
    recordCommand,
  };
}
