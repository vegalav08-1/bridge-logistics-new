import { z } from 'zod';

// Базовые поля для всех документов
export const BaseDocumentSchema = z.object({
  chatId: z.string(),
  type: z.enum(['chat', 'message', 'attachment', 'finance', 'invoice']),
  roles: z.array(z.string()), // ACL теги
  status: z.string().optional(), // для чатов
  adminId: z.string().optional(), // partnerAdminId
  userIds: z.array(z.string()).optional(), // участники
  updatedAt: z.string(), // ISO date
});

export type BaseDocument = z.infer<typeof BaseDocumentSchema>;

// Схема для чатов
export const ChatDocumentSchema = BaseDocumentSchema.extend({
  id: z.string(), // chatId
  type: z.literal('chat'),
  number: z.string(), // номер чата
  requestOldTrackNumber: z.string().optional(), // старый трек-номер
  shipmentTrackingNumber: z.string().optional(), // новый трек-номер
  preview: z.string().optional(), // превью/описание
  status: z.string(), // статус отгрузки
  adminEmail: z.string().optional(), // email админа
  userEmail: z.string().optional(), // email пользователя
  createdAt: z.string(),
});

export type ChatDocument = z.infer<typeof ChatDocumentSchema>;

// Схема для сообщений
export const MessageDocumentSchema = BaseDocumentSchema.extend({
  id: z.string(), // messageId
  type: z.literal('message'),
  text: z.string().optional(), // текст сообщения
  systemText: z.string().optional(), // системный текст (из payload)
  authorEmail: z.string().optional(), // email автора
  kind: z.string().optional(), // тип сообщения
  seq: z.number().optional(), // порядковый номер
  createdAt: z.string(),
});

export type MessageDocument = z.infer<typeof MessageDocumentSchema>;

// Схема для вложений
export const AttachmentDocumentSchema = BaseDocumentSchema.extend({
  id: z.string(), // attachmentId
  type: z.literal('attachment'),
  fileName: z.string(), // имя файла
  mime: z.string(), // MIME тип
  fileType: z.enum(['image', 'pdf', 'video', 'other']), // тип файла
  bytes: z.number().optional(), // размер в байтах
  thumbReady: z.boolean().optional(), // готов ли превью
  width: z.number().optional(), // ширина (для изображений)
  height: z.number().optional(), // высота (для изображений)
  pages: z.number().optional(), // количество страниц (для PDF)
  createdAt: z.string(),
});

export type AttachmentDocument = z.infer<typeof AttachmentDocumentSchema>;

// Схема для финансовых операций
export const FinanceDocumentSchema = BaseDocumentSchema.extend({
  id: z.string(), // "fin:<ledgerId>"
  type: z.literal('finance'),
  title: z.string(), // название операции
  opKind: z.enum(['CHARGE', 'PAYMENT', 'REFUND', 'ADJUSTMENT']), // тип операции
  amount: z.string(), // сумма
  currency: z.string(), // валюта
  invoiceNumber: z.string().optional(), // номер инвойса
  invoiceStatus: z.string().optional(), // статус инвойса
  createdAt: z.string(),
});

export type FinanceDocument = z.infer<typeof FinanceDocumentSchema>;

// Схема для инвойсов
export const InvoiceDocumentSchema = BaseDocumentSchema.extend({
  id: z.string(), // "inv:<invoiceId>"
  type: z.literal('invoice'),
  number: z.string(), // номер инвойса
  status: z.string(), // статус
  amount: z.string(), // сумма
  currency: z.string(), // валюта
  dueDate: z.string().optional(), // дата оплаты
  paidAt: z.string().optional(), // дата оплаты
  createdAt: z.string(),
});

export type InvoiceDocument = z.infer<typeof InvoiceDocumentSchema>;

// Объединённая схема для всех типов документов
export const DocumentSchema = z.discriminatedUnion('type', [
  ChatDocumentSchema,
  MessageDocumentSchema,
  AttachmentDocumentSchema,
  FinanceDocumentSchema,
  InvoiceDocumentSchema,
]);

export type Document = z.infer<typeof DocumentSchema>;

// Настройки индексов
export const IndexSettings = {
  // Настройки для индекса чатов
  chats: {
    primaryKey: 'id',
    searchableAttributes: [
      'number',
      'requestOldTrackNumber',
      'shipmentTrackingNumber',
      'preview',
      'status',
      'adminEmail',
      'userEmail',
    ],
    filterableAttributes: [
      'status',
      'type',
      'adminId',
      'roles',
      'updatedAt',
    ],
    sortableAttributes: [
      'updatedAt',
      'status',
    ],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'exactness',
    ],
  },

  // Настройки для индекса сообщений
  messages: {
    primaryKey: 'id',
    searchableAttributes: [
      'text',
      'systemText',
      'authorEmail',
    ],
    filterableAttributes: [
      'chatId',
      'roles',
      'updatedAt',
      'kind',
    ],
    sortableAttributes: [
      'updatedAt',
    ],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'exactness',
    ],
  },

  // Настройки для индекса вложений
  attachments: {
    primaryKey: 'id',
    searchableAttributes: [
      'fileName',
    ],
    filterableAttributes: [
      'chatId',
      'roles',
      'mime',
      'fileType',
      'updatedAt',
    ],
    sortableAttributes: [
      'updatedAt',
      'bytes',
    ],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'exactness',
    ],
  },

  // Настройки для индекса финансов
  finance: {
    primaryKey: 'id',
    searchableAttributes: [
      'title',
      'invoiceNumber',
    ],
    filterableAttributes: [
      'chatId',
      'roles',
      'opKind',
      'invoiceStatus',
      'currency',
      'updatedAt',
    ],
    sortableAttributes: [
      'createdAt',
      'amount',
    ],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'exactness',
    ],
  },
};

// Утилиты для работы с документами
export function createChatDocument(data: Partial<ChatDocument>): ChatDocument {
  return ChatDocumentSchema.parse(data);
}

export function createMessageDocument(data: Partial<MessageDocument>): MessageDocument {
  return MessageDocumentSchema.parse(data);
}

export function createAttachmentDocument(data: Partial<AttachmentDocument>): AttachmentDocument {
  return AttachmentDocumentSchema.parse(data);
}

export function createFinanceDocument(data: Partial<FinanceDocument>): FinanceDocument {
  return FinanceDocumentSchema.parse(data);
}

export function createInvoiceDocument(data: Partial<InvoiceDocument>): InvoiceDocument {
  return InvoiceDocumentSchema.parse(data);
}

// Валидация документа
export function validateDocument(document: any): Document | null {
  try {
    return DocumentSchema.parse(document);
  } catch (error) {
    console.error('Document validation failed:', error);
    return null;
  }
}

// Получить тип документа
export function getDocumentType(document: any): string | null {
  if (typeof document === 'object' && document !== null) {
    return document.type || null;
  }
  return null;
}

// Проверить, является ли документ чатом
export function isChatDocument(document: any): document is ChatDocument {
  return document?.type === 'chat';
}

// Проверить, является ли документ сообщением
export function isMessageDocument(document: any): document is MessageDocument {
  return document?.type === 'message';
}

// Проверить, является ли документ вложением
export function isAttachmentDocument(document: any): document is AttachmentDocument {
  return document?.type === 'attachment';
}

// Проверить, является ли документ финансовой операцией
export function isFinanceDocument(document: any): document is FinanceDocument {
  return document?.type === 'finance';
}

// Проверить, является ли документ инвойсом
export function isInvoiceDocument(document: any): document is InvoiceDocument {
  return document?.type === 'invoice';
}




