import { z } from 'zod';

export const offerLineSchema = z.object({
  name: z.string().min(2),
  qty: z.number().positive(),
  unit: z.enum(['pcs','kg','m3']),
  price: z.number().nonnegative(),
  discountPct: z.number().min(0).max(100).optional(),
  taxPct: z.number().min(0).max(100).optional(),
});

export const offerSchema = z.object({
  chatId: z.string(),
  currency: z.enum(['RUB','USD','EUR','KZT','CNY']),
  lines: z.array(offerLineSchema).min(1),
  discountPct: z.number().min(0).max(100).optional(),
  taxPct: z.number().min(0).max(100).optional(),
  note: z.string().max(400).optional(),
});

export const invoiceSchema = z.object({
  chatId: z.string(),
  offerId: z.string(),
  currency: z.enum(['RUB','USD','EUR','KZT','CNY']),
  total: z.number().positive(),
  dueAtISO: z.string().optional(),
});

export const paymentSchema = z.object({
  invoiceId: z.string(),
  method: z.enum(['CASH','BANK','CARD']),
  amount: z.number().positive(),
  currency: z.enum(['RUB','USD','EUR','KZT','CNY']),
});


