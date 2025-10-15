import { z } from 'zod';

// Версия протокола
export const PROTOCOL_VERSION = 1;

// Базовые типы
export const EventTypeSchema = z.enum([
  // Сообщения
  'message.created',
  'message.edited',
  'message.deleted',
  
  // Вложения (S7)
  'attachment.preview.ready',
  
  // Чат
  'chat.updated',
  
  // Офферы и отгрузки (S6)
  'offer.proposed',
  'offer.accepted',
  'shipment.created',
  'qr.generated',
  
  // Квитанции
  'receipt.delivered',
  'receipt.read',
  
  // Typing
  'typing.start',
  'typing.stop',
  
  // Системные
  'ping',
  'pong',
  'error',
]);

export type EventType = z.infer<typeof EventTypeSchema>;

// Wire Envelope - формат передачи по сети
export const WireEnvelopeSchema = z.object({
  v: z.literal(PROTOCOL_VERSION),
  id: z.string().cuid(),
  ts: z.number().int().positive(), // server timestamp (ms)
  type: EventTypeSchema,
  room: z.string().optional(), // "chat:{id}" | "user:{id}"
  seq: z.number().int().positive().optional(), // seq для событий сообщений
  data: z.unknown(),
});

export type WireEnvelope = z.infer<typeof WireEnvelopeSchema>;

// Схемы данных для разных типов событий
export const MessageCreatedDataSchema = z.object({
  chatId: z.string().cuid(),
  message: z.object({
    id: z.string().cuid(),
    seq: z.number().int().positive(),
    kind: z.string(),
    payload: z.unknown(),
    authorId: z.string().cuid(),
    createdAt: z.string().datetime(),
  }),
});

export const MessageEditedDataSchema = z.object({
  chatId: z.string().cuid(),
  messageId: z.string().cuid(),
  seq: z.number().int().positive(),
  newPayload: z.unknown(),
  editedAt: z.string().datetime(),
});

export const MessageDeletedDataSchema = z.object({
  chatId: z.string().cuid(),
  messageId: z.string().cuid(),
  seq: z.number().int().positive(),
  deletedAt: z.string().datetime(),
});

export const AttachmentPreviewReadyDataSchema = z.object({
  chatId: z.string().cuid(),
  attachmentId: z.string().cuid(),
  thumbReady: z.boolean(),
});

export const ChatUpdatedDataSchema = z.object({
  chatId: z.string().cuid(),
  updatedAt: z.string().datetime(),
});

export const OfferProposedDataSchema = z.object({
  chatId: z.string().cuid(),
  offerId: z.string().cuid(),
  requestId: z.string().cuid(),
  adminId: z.string().cuid(),
  pricePerKgUSD: z.number(),
  insuranceUSD: z.number().optional(),
  packingUSD: z.number().optional(),
  deliveryDays: z.number().int().optional(),
  deliveryMethod: z.string().optional(),
  notes: z.string().optional(),
});

export const OfferAcceptedDataSchema = z.object({
  chatId: z.string().cuid(),
  offerId: z.string().cuid(),
  userId: z.string().cuid(),
});

export const ShipmentCreatedDataSchema = z.object({
  chatId: z.string().cuid(),
  shipmentId: z.string().cuid(),
  requestId: z.string().cuid(),
  status: z.string(),
});

export const QRGeneratedDataSchema = z.object({
  chatId: z.string().cuid(),
  shipmentId: z.string().cuid(),
  qrCode: z.string(),
  pdfUrl: z.string().optional(),
});

export const ReceiptDeliveredDataSchema = z.object({
  chatId: z.string().cuid(),
  messageSeq: z.number().int().positive(),
  userId: z.string().cuid(),
  at: z.string().datetime(),
});

export const ReceiptReadDataSchema = z.object({
  chatId: z.string().cuid(),
  maxReadSeq: z.number().int().positive(),
  userId: z.string().cuid(),
  at: z.string().datetime(),
});

export const TypingStartDataSchema = z.object({
  chatId: z.string().cuid(),
  userId: z.string().cuid(),
  at: z.string().datetime(),
});

export const TypingStopDataSchema = z.object({
  chatId: z.string().cuid(),
  userId: z.string().cuid(),
  at: z.string().datetime(),
});

export const ErrorDataSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});

// Типы данных
export type MessageCreatedData = z.infer<typeof MessageCreatedDataSchema>;
export type MessageEditedData = z.infer<typeof MessageEditedDataSchema>;
export type MessageDeletedData = z.infer<typeof MessageDeletedDataSchema>;
export type AttachmentPreviewReadyData = z.infer<typeof AttachmentPreviewReadyDataSchema>;
export type ChatUpdatedData = z.infer<typeof ChatUpdatedDataSchema>;
export type OfferProposedData = z.infer<typeof OfferProposedDataSchema>;
export type OfferAcceptedData = z.infer<typeof OfferAcceptedDataSchema>;
export type ShipmentCreatedData = z.infer<typeof ShipmentCreatedDataSchema>;
export type QRGeneratedData = z.infer<typeof QRGeneratedDataSchema>;
export type ReceiptDeliveredData = z.infer<typeof ReceiptDeliveredDataSchema>;
export type ReceiptReadData = z.infer<typeof ReceiptReadDataSchema>;
export type TypingStartData = z.infer<typeof TypingStartDataSchema>;
export type TypingStopData = z.infer<typeof TypingStopDataSchema>;
export type ErrorData = z.infer<typeof ErrorDataSchema>;

// Union тип для всех данных событий
export type EventData = 
  | MessageCreatedData
  | MessageEditedData
  | MessageDeletedData
  | AttachmentPreviewReadyData
  | ChatUpdatedData
  | OfferProposedData
  | OfferAcceptedData
  | ShipmentCreatedData
  | QRGeneratedData
  | ReceiptDeliveredData
  | ReceiptReadData
  | TypingStartData
  | TypingStopData
  | ErrorData;

// Валидация данных по типу события
export function validateEventData(type: EventType, data: unknown): EventData | null {
  try {
    switch (type) {
      case 'message.created':
        return MessageCreatedDataSchema.parse(data);
      case 'message.edited':
        return MessageEditedDataSchema.parse(data);
      case 'message.deleted':
        return MessageDeletedDataSchema.parse(data);
      case 'attachment.preview.ready':
        return AttachmentPreviewReadyDataSchema.parse(data);
      case 'chat.updated':
        return ChatUpdatedDataSchema.parse(data);
      case 'offer.proposed':
        return OfferProposedDataSchema.parse(data);
      case 'offer.accepted':
        return OfferAcceptedDataSchema.parse(data);
      case 'shipment.created':
        return ShipmentCreatedDataSchema.parse(data);
      case 'qr.generated':
        return QRGeneratedDataSchema.parse(data);
      case 'receipt.delivered':
        return ReceiptDeliveredDataSchema.parse(data);
      case 'receipt.read':
        return ReceiptReadDataSchema.parse(data);
      case 'typing.start':
        return TypingStartDataSchema.parse(data);
      case 'typing.stop':
        return TypingStopDataSchema.parse(data);
      case 'error':
        return ErrorDataSchema.parse(data);
      case 'ping':
      case 'pong':
        return null; // Эти события не имеют данных
      default:
        return null;
    }
  } catch (error) {
    console.error(`Validation failed for event type ${type}:`, error);
    return null;
  }
}

// Создание WireEnvelope
export function createWireEnvelope(
  type: EventType,
  data: EventData | null,
  options: {
    room?: string;
    seq?: number;
  } = {}
): WireEnvelope {
  return {
    v: PROTOCOL_VERSION,
    id: require('cuid')(),
    ts: Date.now(),
    type,
    room: options.room,
    seq: options.seq,
    data: data || {},
  };
}

// Валидация входящего WireEnvelope
export function validateWireEnvelope(raw: unknown): WireEnvelope | null {
  try {
    const envelope = WireEnvelopeSchema.parse(raw);
    
    // Дополнительная валидация данных
    const validatedData = validateEventData(envelope.type, envelope.data);
    if (validatedData === null && envelope.data !== null && envelope.data !== undefined) {
      return null;
    }
    
    return envelope;
  } catch (error) {
    console.error('WireEnvelope validation failed:', error);
    return null;
  }
}




