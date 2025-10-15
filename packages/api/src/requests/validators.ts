import { z } from 'zod';

export const createRequestSchema = z.object({
  description: z.string().min(1).max(500),
  weightKg: z.number().positive().optional(),
  boxPcs: z.number().int().positive().optional(),
  volumeM3: z.number().positive().optional(),
  oldTrackNumber: z.string().max(100).optional(),
  costOfGoodsUSD: z.number().positive().optional(),
  packingType: z.string().max(200).optional(),
  receiptAddress: z.string().max(500).optional(),
});

export const createShipmentSchema = z.object({
  description: z.string().min(1).max(500),
  notes: z.string().max(1000).optional(),
});

export const createMessageSchema = z.object({
  clientId: z.string().uuid().optional(),
  kind: z.enum(['text', 'system']),
  text: z.string().min(1).max(2000).optional(),
  payload: z.record(z.any()).optional(),
});





