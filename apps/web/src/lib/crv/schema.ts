import { z } from 'zod';

export const crFieldDeliveryAddress = z.object({
  key: z.literal('delivery.address'),
  old: z.string().optional(),
  next: z.string().min(4),
});

export const crFieldDeliveryCity = z.object({
  key: z.literal('delivery.city'), old: z.string().optional(), next: z.string().min(2),
});

export const crFieldDeliveryDate = z.object({
  key: z.literal('delivery.date'), old: z.string().optional(), next: z.string().datetime(),
});

export const crFieldPricingTotal = z.object({
  key: z.literal('pricing.total'),
  old: z.number().nonnegative().optional(),
  next: z.number().nonnegative(),
  currency: z.string().length(3),
});

export const crFieldItemsAdd = z.object({
  key: z.literal('items.add'),
  next: z.array(z.object({
    sku: z.string().min(1),
    name: z.string().min(1),
    qty: z.number().positive(),
    weight: z.number().nonnegative().optional(),
  })).min(1),
});

export const crFieldItemsRemove = z.object({
  key: z.literal('items.remove'),
  next: z.array(z.object({ sku: z.string().min(1), qty: z.number().positive().optional() })).min(1),
});

export const crFieldMetaNote = z.object({
  key: z.literal('meta.note'), next: z.string().min(2),
});

export const crField = z.discriminatedUnion('key', [
  crFieldDeliveryAddress, crFieldDeliveryCity, crFieldDeliveryDate,
  crFieldPricingTotal, crFieldItemsAdd, crFieldItemsRemove, crFieldMetaNote,
]);

export const crCreateSchema = z.object({
  orderId: z.string(),
  rationale: z.string().min(4),
  fields: z.array(crField).min(1),
  baseVersion: z.number().int().nonnegative(),
});

export const crDecisionSchema = z.object({
  crId: z.string(),
  decision: z.enum(['APPROVE', 'REJECT']),
  comment: z.string().optional(),
});

export const rollbackSchema = z.object({
  orderId: z.string(),
  targetVersion: z.number().int().positive(),
  reason: z.string().min(4),
});

