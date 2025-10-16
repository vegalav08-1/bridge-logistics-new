import { z } from 'zod';

// Строгие валидаторы для S6

export const createRequestSchema = z.object({
  description: z
    .string()
    .min(4, 'Описание должно содержать минимум 4 символа')
    .max(120, 'Описание не должно превышать 120 символов')
    .transform((s) => s.trim().replace(/\s+/g, ' ')), // убираем переносы и лишние пробелы
  oldTrackNumber: z
    .string()
    .min(3, 'Старый трек должен содержать минимум 3 символа')
    .max(50, 'Старый трек не должен превышать 50 символов')
    .optional(),
  weightKg: z
    .number()
    .min(0, 'Вес не может быть отрицательным')
    .max(10000, 'Вес не должен превышать 10000 кг')
    .transform((n) => Math.round(n * 1000) / 1000) // округляем до 3 знаков
    .optional(),
  boxPcs: z
    .number()
    .int('Количество коробок должно быть целым числом')
    .min(0, 'Количество коробок не может быть отрицательным')
    .max(1000, 'Количество коробок не должно превышать 1000')
    .optional(),
  volumeM3: z
    .number()
    .min(0, 'Объём не может быть отрицательным')
    .max(1000, 'Объём не должен превышать 1000 м³')
    .transform((n) => Math.round(n * 10000) / 10000) // округляем до 4 знаков
    .optional(),
  costOfGoodsUSD: z
    .number()
    .min(0, 'Стоимость товара не может быть отрицательной')
    .transform((n) => Math.round(n * 100) / 100) // округляем до 2 знаков
    .optional(),
  receiptAddress: z
    .string()
    .max(200, 'Адрес прибытия не должен превышать 200 символов')
    .optional(),
  packingType: z
    .enum([
      'Скотч + мешок',
      'Деревянные уголки', 
      'Деревянная обрешётка',
      'Деревянный ящик',
      'Палет'
    ])
    .optional(),
  image: z.string().optional(), // в S7 будет presigned upload
});

export const createShipmentSchema = z.object({
  description: z
    .string()
    .min(4, 'Описание должно содержать минимум 4 символа')
    .max(120, 'Описание не должно превышать 120 символов')
    .transform((s) => s.trim().replace(/\s+/g, ' ')),
  oldTrackNumber: z
    .string()
    .min(3, 'Старый трек должен содержать минимум 3 символа')
    .max(50, 'Старый трек не должен превышать 50 символов')
    .optional(),
  weightKg: z
    .number()
    .min(0, 'Вес не может быть отрицательным')
    .max(10000, 'Вес не должен превышать 10000 кг')
    .transform((n) => Math.round(n * 1000) / 1000)
    .optional(),
  boxPcs: z
    .number()
    .int('Количество коробок должно быть целым числом')
    .min(0, 'Количество коробок не может быть отрицательным')
    .max(1000, 'Количество коробок не должно превышать 1000')
    .optional(),
  volumeM3: z
    .number()
    .min(0, 'Объём не может быть отрицательным')
    .max(1000, 'Объём не должен превышать 1000 м³')
    .transform((n) => Math.round(n * 10000) / 10000)
    .optional(),
  costOfGoodsUSD: z
    .number()
    .min(0, 'Стоимость товара не может быть отрицательной')
    .transform((n) => Math.round(n * 100) / 100)
    .optional(),
  receiptAddress: z
    .string()
    .max(200, 'Адрес прибытия не должен превышать 200 символов')
    .optional(),
  packingType: z
    .enum([
      'Скотч + мешок',
      'Деревянные уголки',
      'Деревянная обрешётка', 
      'Деревянный ящик',
      'Палет'
    ])
    .optional(),
  image: z.string().optional(),
});

export const createOfferSchema = z.object({
  requestId: z.string().cuid('Неверный ID запроса'),
  pricePerKgUSD: z
    .number()
    .positive('Цена за кг должна быть положительной')
    .transform((n) => Math.round(n * 100) / 100), // до 2 знаков
  insuranceUSD: z
    .number()
    .min(0, 'Страховая сумма не может быть отрицательной')
    .transform((n) => Math.round(n * 100) / 100)
    .optional(),
  packingUSD: z
    .number()
    .min(0, 'Стоимость упаковки не может быть отрицательной')
    .transform((n) => Math.round(n * 100) / 100)
    .optional(),
  deliveryDays: z
    .number()
    .int('Срок доставки должен быть целым числом')
    .min(1, 'Срок доставки должен быть минимум 1 день')
    .max(90, 'Срок доставки не должен превышать 90 дней')
    .optional(),
  deliveryMethod: z
    .enum(['avia', 'sea', 'express', 'ground'])
    .optional(),
  notes: z
    .string()
    .max(180, 'Примечания не должны превышать 180 символов')
    .optional(),
});

export const acceptOfferSchema = z.object({
  offerId: z.string().cuid('Неверный ID оффера'),
});

export const archiveRequestSchema = z.object({
  requestId: z.string().cuid('Неверный ID запроса'),
});

export const duplicateRequestSchema = z.object({
  requestId: z.string().cuid('Неверный ID запроса'),
});

export const receiveShipmentSchema = z.object({
  mode: z.enum(['full', 'partial'], {
    message: 'Режим должен быть "full" или "partial"'
  }),
  notes: z
    .string()
    .max(200, 'Примечания не должны превышать 200 символов')
    .optional(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type AcceptOfferInput = z.infer<typeof acceptOfferSchema>;
export type ArchiveRequestInput = z.infer<typeof archiveRequestSchema>;
export type DuplicateRequestInput = z.infer<typeof duplicateRequestSchema>;
export type ReceiveShipmentInput = z.infer<typeof receiveShipmentSchema>;