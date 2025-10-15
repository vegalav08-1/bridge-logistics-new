import { z } from 'zod';

// WireEnvelope protocol (shared with server)
export const WireEnvelopeSchema = z.object({
  v: z.literal(1),
  id: z.string(),
  ts: z.number(),
  type: z.string(),
  room: z.string().optional(),
  seq: z.number().optional(),
  data: z.unknown(),
});

export type WireEnvelope = z.infer<typeof WireEnvelopeSchema>;

// Client commands
export const ClientSubscribeCmdSchema = z.object({
  op: z.literal('subscribe'),
  rooms: z.array(z.string()),
});

export const ClientUnsubscribeCmdSchema = z.object({
  op: z.literal('unsubscribe'),
  rooms: z.array(z.string()),
});

export const ClientTypingCmdSchema = z.object({
  op: z.literal('typing'),
  chatId: z.string(),
  action: z.enum(['start', 'stop']),
});

export const ClientAckCmdSchema = z.object({
  op: z.literal('ack'),
  chatId: z.string(),
  seq: z.number(),
  kind: z.enum(['delivered', 'read']),
});

export const ClientPingCmdSchema = z.object({
  op: z.literal('ping'),
  ts: z.number(),
});

export const ClientCmdSchema = z.discriminatedUnion('op', [
  ClientSubscribeCmdSchema,
  ClientUnsubscribeCmdSchema,
  ClientTypingCmdSchema,
  ClientAckCmdSchema,
  ClientPingCmdSchema,
]);

export type ClientCmd = z.infer<typeof ClientCmdSchema>;

// Event data types
export const MessageCreatedEventDataSchema = z.object({
  chatId: z.string(),
  message: z.object({
    id: z.string(),
    seq: z.number(),
    kind: z.string(),
    payload: z.unknown(),
    authorId: z.string(),
    createdAt: z.string(),
  }),
});

export const AttachmentPreviewReadyEventDataSchema = z.object({
  chatId: z.string(),
  attachmentId: z.string(),
  thumbReady: z.literal(true),
});

export const ChatUpdatedEventDataSchema = z.object({
  chatId: z.string(),
  updatedAt: z.string(),
});

export const ReceiptDeliveredEventDataSchema = z.object({
  chatId: z.string(),
  messageSeq: z.number(),
  userId: z.string(),
  at: z.string(),
});

export const ReceiptReadEventDataSchema = z.object({
  chatId: z.string(),
  maxReadSeq: z.number(),
  userId: z.string(),
  at: z.string(),
});

export const TypingEventDataSchema = z.object({
  chatId: z.string(),
  userId: z.string(),
  at: z.string(),
});

export type MessageCreatedEventData = z.infer<typeof MessageCreatedEventDataSchema>;
export type AttachmentPreviewReadyEventData = z.infer<typeof AttachmentPreviewReadyEventDataSchema>;
export type ChatUpdatedEventData = z.infer<typeof ChatUpdatedEventDataSchema>;
export type ReceiptDeliveredEventData = z.infer<typeof ReceiptDeliveredEventDataSchema>;
export type ReceiptReadEventData = z.infer<typeof ReceiptReadEventDataSchema>;
export type TypingEventData = z.infer<typeof TypingEventDataSchema>;

// Client configuration
export interface RealtimeClientConfig {
  baseUrl: string;
  token: string;
  wsPath?: string;
  ssePath?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  backfillLimit?: number;
  enableSSE?: boolean;
  enableOfflineQueue?: boolean;
}

// Connection state
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed',
}

// Export individual states for external use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const { 
  DISCONNECTED, 
  CONNECTING, 
  CONNECTED, 
  RECONNECTING, 
  FAILED 
} = ConnectionState;

// Event types
export type RealtimeEventType = 
  | 'message.created'
  | 'message.edited'
  | 'message.deleted'
  | 'attachment.preview.ready'
  | 'chat.updated'
  | 'offer.proposed'
  | 'offer.accepted'
  | 'shipment.created'
  | 'qr.generated'
  | 'receipt.delivered'
  | 'receipt.read'
  | 'typing.start'
  | 'typing.stop';

export type RealtimeEventHandler<T = unknown> = (_data: T) => void;

// Offline message
export interface OfflineMessage {
  id: string;
  type: 'message' | 'typing' | 'ack';
  payload: unknown;
  timestamp: number;
  retryCount: number;
}
