import { z } from 'zod';

// Валидация для Parcel
export const parcelCreateSchema = z.object({
  chatId: z.string().cuid(),
  parentId: z.string().cuid().optional(),
  code: z.string().min(1).max(50),
  name: z.string().optional(),
  kind: z.enum(['box', 'pallet', 'crating']),
  pieces: z.number().int().min(1).max(10000).optional(),
  weightKg: z.number().min(0).max(2000).optional(),
  lengthCm: z.number().min(0).max(300).optional(),
  widthCm: z.number().min(0).max(300).optional(),
  heightCm: z.number().min(0).max(300).optional(),
  attrs: z.string().optional(), // JSON строка
});

export const parcelUpdateSchema = z.object({
  name: z.string().optional(),
  kind: z.enum(['box', 'pallet', 'crating']).optional(),
  pieces: z.number().int().min(1).max(10000).optional(),
  weightKg: z.number().min(0).max(2000).optional(),
  lengthCm: z.number().min(0).max(300).optional(),
  widthCm: z.number().min(0).max(300).optional(),
  heightCm: z.number().min(0).max(300).optional(),
  attrs: z.string().optional(),
});

export const parcelMoveSchema = z.object({
  parentId: z.string().cuid().optional(),
});

// Валидация для PackingPreset
export const presetCreateSchema = z.object({
  name: z.string().min(1).max(100),
  kind: z.enum(['box', 'pallet', 'crating']),
  dims: z.string(), // JSON строка с {l,w,h}
  priceRules: z.string(), // JSON строка с правилами ценообразования
  isDefault: z.boolean().optional(),
});

export const presetUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  kind: z.enum(['box', 'pallet', 'crating']).optional(),
  dims: z.string().optional(),
  priceRules: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// Валидация для генерации этикеток
export const labelsGenerateSchema = z.object({
  parcelIds: z.array(z.string().cuid()).min(1).max(50),
  format: z.enum(['A7', 'A6']).optional().default('A7'),
  orientation: z.enum(['portrait', 'landscape']).optional().default('portrait'),
});

// Валидация для bulk создания Parcel
export const parcelsBulkCreateSchema = z.object({
  parcels: z.array(parcelCreateSchema).min(1).max(100),
});

// Типы для экспорта
export type ParcelCreateInput = z.infer<typeof parcelCreateSchema>;
export type ParcelUpdateInput = z.infer<typeof parcelUpdateSchema>;
export type ParcelMoveInput = z.infer<typeof parcelMoveSchema>;
export type PresetCreateInput = z.infer<typeof presetCreateSchema>;
export type PresetUpdateInput = z.infer<typeof presetUpdateSchema>;
export type LabelsGenerateInput = z.infer<typeof labelsGenerateSchema>;
export type ParcelsBulkCreateInput = z.infer<typeof parcelsBulkCreateSchema>;





