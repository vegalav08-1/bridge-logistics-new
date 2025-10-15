export { RealtimeServer, RealtimeServerConfig, AuthenticatedUser, ClientCommand, RealtimeConnection } from './server';
export { EventBus, createEventBus } from './bus';
export { 
  WireEnvelope, 
  WireEnvelopeSchema,
  MessageCreatedDataSchema,
  AttachmentPreviewReadyDataSchema,
  ChatUpdatedDataSchema,
  ReceiptDeliveredDataSchema,
  ReceiptReadDataSchema,
  TypingStartDataSchema,
  TypingStopDataSchema,
} from './events';
export { createReceiptsManager, formatReceiptStatus, getReceiptEmoji } from './receipts';
export { createPresenceManager, formatTypingMessage, getTypingDuration, TypingUser } from './presence';
export { SSEConnection, SSEClientCommand } from './sse';

// S8 Integrations
export {
  publishMessageCreated,
  publishMessageEdited,
  publishMessageDeleted,
  publishChatUpdated,
  publishOfferProposed,
  publishOfferAccepted,
  publishShipmentCreated,
  publishQRGenerated,
  publishAttachmentPreviewReady,
  publishReceiptDelivered,
  publishReceiptRead,
  publishTypingStart,
  publishTypingStop,
} from './integrations';

// Metrics and Observability
export { metrics, getPrometheusMetrics, getHealthStatus } from './metrics';

// Security
export {
  canSubscribeToRoom,
  canPublishToRoom,
  validateCommand,
  validateConnection,
  sanitizeRoomName,
  validateMessageSize,
  detectSuspiciousActivity,
  createSecurityMiddleware,
} from './security';
