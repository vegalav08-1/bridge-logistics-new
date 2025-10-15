import { z } from 'zod';

export const itemSchema = z.object({
  sku: z.string().min(3),
  name: z.string().min(2),
  unit: z.enum(['pcs','kg','m','set']),
  stock: z.number().int().nonnegative(),
  reserved: z.number().int().nonnegative(),
  weight: z.number().optional(),
  volume: z.number().optional(),
  priceCost: z.number().optional(),
});

export const packageSchema = z.object({
  shipmentId: z.string(),
  items: z.array(z.object({ itemId: z.string(), qty: z.number().positive() })),
  weight: z.number().optional(),
  volume: z.number().optional(),
});


