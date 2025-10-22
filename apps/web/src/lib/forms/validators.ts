import { z } from 'zod';

// Схема для товара
export const itemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Наименование товара обязательно'),
  quantity: z.coerce.number().positive('Количество должно быть больше 0'),
  price: z.coerce.number().positive('Цена должна быть больше 0'),
  oldTracking: z.string().optional(),
  photos: z.array(z.string()).max(3, 'Максимум 3 фотографии').default([]),
});

// Схема для посылки
export const boxSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  weight: z.coerce.number().min(0, 'Вес не может быть отрицательным').optional(),
  dimensions: z.object({
    length: z.coerce.number().min(0, 'Длина не может быть отрицательной').optional(),
    width: z.coerce.number().min(0, 'Ширина не может быть отрицательной').optional(),
    height: z.coerce.number().min(0, 'Высота не может быть отрицательной').optional(),
  }),
  photo: z.string().optional(),
});

export const baseSchema = z.object({
  partnerName: z.string().optional(),
  shortDesc: z.string().trim().min(1, 'Опишите кратко (минимум 1 символ)').max(120, 'Не более 120 символов'),
  arrivalAddress: z.string().trim().min(1, 'Выберите адрес прибытия'),
  attachmentId: z.string().optional(),
});

export const shipmentSchema = baseSchema.extend({
  // Товары
  items: z.array(itemSchema).min(1, 'Добавьте хотя бы один товар'),
  totalCost: z.coerce.number().positive('Общая стоимость должна быть больше 0'),
  
  // Характеристики
  totalWeightKg: z.coerce.number().min(0, 'Вес не может быть отрицательным').max(10000, 'Слишком большой вес').optional(),
  boxesCount: z.coerce.number().int('Только целое число').min(0, 'Не может быть отрицательным').max(5000, 'Слишком много коробок').optional(),
  boxes: z.array(boxSchema).min(1, 'Добавьте хотя бы одну коробку'),
  totalVolumeM3: z.coerce.number().positive('Объём должен быть > 0').max(100, 'Слишком большой объём'),
});

export type BaseFormInput = z.infer<typeof baseSchema>;
export type ShipmentFormInput = z.infer<typeof shipmentSchema>;
export type ItemInput = z.infer<typeof itemSchema>;
export type BoxInput = z.infer<typeof boxSchema>;




