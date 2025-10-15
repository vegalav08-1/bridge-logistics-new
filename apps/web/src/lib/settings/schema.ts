import { z } from 'zod';

export const profileSchema = z.object({
  companyName: z.string().min(2).optional(),
  contactName: z.string().min(2).optional(),
  phone: z.string().min(6).optional(),
  email: z.string().email().optional(),
});

export const citySchema = z.object({ defaultCity: z.string().min(2) });
export const shippingSchema = z.object({ shippingType: z.enum(['AIR','SEA','TRUCK','RAIL','COURIER']) });
export const receiptSchema = z.object({ receiptAddress: z.string().min(4) });

export const warehouseSchema = z.object({
  id: z.string().optional(), // при создании может быть пустым
  label: z.string().min(2),
  address: z.string().min(4),
  phone: z.string().optional(),
});


