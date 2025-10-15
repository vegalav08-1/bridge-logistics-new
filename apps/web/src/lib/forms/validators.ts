import { z } from 'zod';

export const baseSchema = z.object({
  partnerName: z.string().optional(),
  shortDesc: z.string().trim().min(1, 'Опишите кратко (минимум 1 символ)').max(120, 'Не более 120 символов'),
  oldTracking: z.string().trim().min(3, 'Укажите старый трек-номер'),
  packType: z.enum(['SCOTCH_BAG','WOOD_CORNERS','WOOD_CRATE','WOOD_BOX','PALLET'], { required_error: 'Выберите тип упаковки' }),
  arrivalAddress: z.string().trim().min(5, 'Укажите адрес прибытия'),
  attachmentId: z.string().optional(),
});

export const shipmentSchema = baseSchema.extend({
  totalWeightKg: z.coerce.number().positive('Вес должен быть > 0').max(10000, 'Слишком большой вес').optional(),
  totalVolumeM3: z.coerce.number().positive('Объём должен быть > 0').max(100, 'Слишком большой объём').optional(),
  boxesCount: z.coerce.number().int('Только целое число').positive('Не менее 1').max(5000, 'Слишком много коробок').optional(),
});

export type BaseFormInput = z.infer<typeof baseSchema>;
export type ShipmentFormInput = z.infer<typeof shipmentSchema>;


