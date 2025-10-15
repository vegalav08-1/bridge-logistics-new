import { z } from 'zod';
import { LOGISTICS_ACTIONS } from './shipments';

// Базовые схемы
const ParcelSchema = z.object({
  code: z.string().min(1).max(50),
  weightKg: z.number().positive().optional(),
  lengthCm: z.number().positive().optional(),
  widthCm: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  volumeM3: z.number().positive().optional(),
  pieces: z.number().int().positive().optional(),
  kind: z.enum(['box', 'pallet', 'bundle', 'other']).optional(),
});

const MissingItemSchema = z.object({
  parcelCode: z.string().optional(),
  description: z.string().min(1).max(200),
  quantity: z.number().int().positive().optional(),
  weight: z.number().positive().optional(),
});

const DiscrepancySchema = z.object({
  type: z.enum(['weight', 'quantity', 'damage', 'missing', 'extra']),
  description: z.string().min(1).max(500),
  expected: z.string().optional(),
  actual: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high']).default('medium'),
});

// Валидаторы для каждого действия
export const ActionPayloadValidators = {
  // Приёмка
  [LOGISTICS_ACTIONS.RECEIVE_FULL]: z.object({
    note: z.string().max(500).optional(),
    photos: z.array(z.string()).optional(), // attachmentIds
    parcels: z.array(ParcelSchema).optional(),
  }),

  [LOGISTICS_ACTIONS.RECEIVE_PARTIAL]: z.object({
    missing: z.array(MissingItemSchema).min(1),
    note: z.string().max(500).optional(),
    photos: z.array(z.string()).optional(), // attachmentIds
    parcels: z.array(ParcelSchema).optional(),
  }),

  // Сверка
  [LOGISTICS_ACTIONS.RECONCILE_CREATE]: z.object({
    discrepancies: z.array(DiscrepancySchema).min(1),
    document: z.string().optional(), // attachmentId акта сверки
    note: z.string().max(500).optional(),
    parcels: z.array(ParcelSchema).optional(),
  }),

  [LOGISTICS_ACTIONS.RECONCILE_CONFIRM]: z.object({
    confirmedBy: z.enum(['ADMIN', 'USER']),
    note: z.string().max(500).optional(),
    signature: z.string().optional(), // base64 подпись или код
  }),

  // Упаковка
  [LOGISTICS_ACTIONS.PACK_CONFIGURE]: z.object({
    parcels: z.array(ParcelSchema).min(1),
    packingType: z.enum(['tape_bag', 'wood_corners', 'wood_crate', 'wood_box', 'pallet']).optional(),
    note: z.string().max(500).optional(),
  }),

  [LOGISTICS_ACTIONS.PACK_COMPLETE]: z.object({
    finalParcels: z.array(ParcelSchema).min(1),
    packingType: z.enum(['tape_bag', 'wood_corners', 'wood_crate', 'wood_box', 'pallet']).optional(),
    photos: z.array(z.string()).optional(), // attachmentIds упакованного груза
    note: z.string().max(500).optional(),
  }),

  // Совмещение
  [LOGISTICS_ACTIONS.MERGE_ATTACH]: z.object({
    children: z.array(z.string()).min(1), // chatIds дочерних отгрузок
    note: z.string().max(500).optional(),
  }),

  [LOGISTICS_ACTIONS.MERGE_DETACH]: z.object({
    children: z.array(z.string()).min(1), // chatIds отгружаемых отгрузок
    note: z.string().max(500).optional(),
  }),

  [LOGISTICS_ACTIONS.MERGE_COMPLETE]: z.object({
    finalChildren: z.array(z.string()).optional(), // chatIds финального списка детей
    note: z.string().max(500).optional(),
  }),

  // Транзит
  [LOGISTICS_ACTIONS.ARRIVAL_CITY]: z.object({
    city: z.string().min(1).max(100),
    hub: z.string().min(1).max(100).optional(), // склад/хаб
    eta: z.string().datetime().optional(), // ожидаемое время выдачи
    trackingNumber: z.string().max(100).optional(),
    note: z.string().max(500).optional(),
  }),

  // Выдача
  [LOGISTICS_ACTIONS.HANDOVER_CONFIRM]: z.object({
    confirmedBy: z.enum(['ADMIN', 'USER']),
    confirmationType: z.enum(['code', 'signature', 'photo', 'pin']).optional(),
    confirmationValue: z.string().optional(), // код/подпись/attachmentId
    recipientName: z.string().max(100).optional(),
    recipientId: z.string().max(50).optional(), // документ получателя
    note: z.string().max(500).optional(),
  }),

  // Управление
  [LOGISTICS_ACTIONS.CANCEL]: z.object({
    reason: z.string().min(1).max(500),
    note: z.string().max(500).optional(),
  }),

  [LOGISTICS_ACTIONS.ARCHIVE]: z.object({
    note: z.string().max(500).optional(),
  }),
} as const;

// Функция для валидации payload действия
export function validateActionPayload(action: string, payload: unknown): { valid: boolean; error?: string; data?: unknown } {
  const validator = ActionPayloadValidators[action as keyof typeof ActionPayloadValidators];
  
  if (!validator) {
    return { valid: false, error: `Unknown action: ${action}` };
  }

  try {
    const result = validator.parse(payload);
    return { valid: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return { valid: false, error: `Validation failed: ${errorMessages}` };
    }
    return { valid: false, error: 'Unknown validation error' };
  }
}

// Схема для запроса перехода
export const TransitionRequestSchema = z.object({
  action: z.enum([
    LOGISTICS_ACTIONS.RECEIVE_FULL,
    LOGISTICS_ACTIONS.RECEIVE_PARTIAL,
    LOGISTICS_ACTIONS.RECONCILE_CREATE,
    LOGISTICS_ACTIONS.RECONCILE_CONFIRM,
    LOGISTICS_ACTIONS.PACK_CONFIGURE,
    LOGISTICS_ACTIONS.PACK_COMPLETE,
    LOGISTICS_ACTIONS.MERGE_ATTACH,
    LOGISTICS_ACTIONS.MERGE_DETACH,
    LOGISTICS_ACTIONS.MERGE_COMPLETE,
    LOGISTICS_ACTIONS.ARRIVAL_CITY,
    LOGISTICS_ACTIONS.HANDOVER_CONFIRM,
    LOGISTICS_ACTIONS.CANCEL,
    LOGISTICS_ACTIONS.ARCHIVE,
  ]),
  payload: z.unknown(),
  clientId: z.string().uuid(),
});

// Схема для ответа перехода
export const TransitionResponseSchema = z.object({
  ok: z.boolean(),
  from: z.string(),
  to: z.string().nullable(),
  systemMessage: z.object({
    id: z.string(),
    seq: z.number(),
    payload: z.unknown(),
  }).optional(),
  auditId: z.string().optional(),
  actionId: z.string().optional(),
  error: z.string().optional(),
});

// Схема для таймлайна
export const TimelineItemSchema = z.object({
  id: z.string(),
  type: z.enum(['message', 'transition', 'action']),
  timestamp: z.string().datetime(),
  data: z.unknown(),
});

export const TimelineResponseSchema = z.object({
  items: z.array(TimelineItemSchema),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});

// Типы для TypeScript
export type TransitionRequest = z.infer<typeof TransitionRequestSchema>;
export type TransitionResponse = z.infer<typeof TransitionResponseSchema>;
export type TimelineItem = z.infer<typeof TimelineItemSchema>;
export type TimelineResponse = z.infer<typeof TimelineResponseSchema>;

// Типы payload для каждого действия
export type ReceiveFullPayload = z.infer<typeof ActionPayloadValidators[typeof LOGISTICS_ACTIONS.RECEIVE_FULL]>;
export type ReceivePartialPayload = z.infer<typeof ActionPayloadValidators[typeof LOGISTICS_ACTIONS.RECEIVE_PARTIAL]>;
export type ReconcileCreatePayload = z.infer<typeof ActionPayloadValidators[typeof LOGISTICS_ACTIONS.RECONCILE_CREATE]>;
export type ReconcileConfirmPayload = z.infer<typeof ActionPayloadValidators[typeof LOGISTICS_ACTIONS.RECONCILE_CONFIRM]>;
export type PackConfigurePayload = z.infer<typeof ActionPayloadValidators[typeof LOGISTICS_ACTIONS.PACK_CONFIGURE]>;
export type PackCompletePayload = z.infer<typeof ActionPayloadValidators[typeof LOGISTICS_ACTIONS.PACK_COMPLETE]>;
export type MergeAttachPayload = z.infer<typeof ActionPayloadValidators[typeof LOGISTICS_ACTIONS.MERGE_ATTACH]>;
export type MergeDetachPayload = z.infer<typeof ActionPayloadValidators[typeof LOGISTICS_ACTIONS.MERGE_DETACH]>;
export type MergeCompletePayload = z.infer<typeof ActionPayloadValidators[typeof LOGISTICS_ACTIONS.MERGE_COMPLETE]>;
export type ArrivalCityPayload = z.infer<typeof ActionPayloadValidators[typeof LOGISTICS_ACTIONS.ARRIVAL_CITY]>;
export type HandoverConfirmPayload = z.infer<typeof ActionPayloadValidators[typeof LOGISTICS_ACTIONS.HANDOVER_CONFIRM]>;
export type CancelPayload = z.infer<typeof ActionPayloadValidators[typeof LOGISTICS_ACTIONS.CANCEL]>;
export type ArchivePayload = z.infer<typeof ActionPayloadValidators[typeof LOGISTICS_ACTIONS.ARCHIVE]>;

// Утилиты для работы с payload
export function createReceiveFullPayload(data: Partial<ReceiveFullPayload>): ReceiveFullPayload {
  return ActionPayloadValidators[LOGISTICS_ACTIONS.RECEIVE_FULL].parse(data);
}

export function createReceivePartialPayload(data: Partial<ReceivePartialPayload>): ReceivePartialPayload {
  return ActionPayloadValidators[LOGISTICS_ACTIONS.RECEIVE_PARTIAL].parse(data);
}

export function createReconcileCreatePayload(data: Partial<ReconcileCreatePayload>): ReconcileCreatePayload {
  return ActionPayloadValidators[LOGISTICS_ACTIONS.RECONCILE_CREATE].parse(data);
}

export function createReconcileConfirmPayload(data: Partial<ReconcileConfirmPayload>): ReconcileConfirmPayload {
  return ActionPayloadValidators[LOGISTICS_ACTIONS.RECONCILE_CONFIRM].parse(data);
}

export function createPackConfigurePayload(data: Partial<PackConfigurePayload>): PackConfigurePayload {
  return ActionPayloadValidators[LOGISTICS_ACTIONS.PACK_CONFIGURE].parse(data);
}

export function createPackCompletePayload(data: Partial<PackCompletePayload>): PackCompletePayload {
  return ActionPayloadValidators[LOGISTICS_ACTIONS.PACK_COMPLETE].parse(data);
}

export function createMergeAttachPayload(data: Partial<MergeAttachPayload>): MergeAttachPayload {
  return ActionPayloadValidators[LOGISTICS_ACTIONS.MERGE_ATTACH].parse(data);
}

export function createMergeDetachPayload(data: Partial<MergeDetachPayload>): MergeDetachPayload {
  return ActionPayloadValidators[LOGISTICS_ACTIONS.MERGE_DETACH].parse(data);
}

export function createMergeCompletePayload(data: Partial<MergeCompletePayload>): MergeCompletePayload {
  return ActionPayloadValidators[LOGISTICS_ACTIONS.MERGE_COMPLETE].parse(data);
}

export function createArrivalCityPayload(data: Partial<ArrivalCityPayload>): ArrivalCityPayload {
  return ActionPayloadValidators[LOGISTICS_ACTIONS.ARRIVAL_CITY].parse(data);
}

export function createHandoverConfirmPayload(data: Partial<HandoverConfirmPayload>): HandoverConfirmPayload {
  return ActionPayloadValidators[LOGISTICS_ACTIONS.HANDOVER_CONFIRM].parse(data);
}

export function createCancelPayload(data: Partial<CancelPayload>): CancelPayload {
  return ActionPayloadValidators[LOGISTICS_ACTIONS.CANCEL].parse(data);
}

export function createArchivePayload(data: Partial<ArchivePayload>): ArchivePayload {
  return ActionPayloadValidators[LOGISTICS_ACTIONS.ARCHIVE].parse(data);
}




