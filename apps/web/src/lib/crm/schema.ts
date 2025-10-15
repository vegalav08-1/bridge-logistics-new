import { z } from 'zod';

export const contactSchema = z.object({
  id: z.string(),
  kind: z.enum(['PHONE', 'EMAIL', 'TELEGRAM', 'WHATSAPP', 'OTHER']),
  value: z.string().min(2),
  primary: z.boolean().optional(),
  verified: z.boolean().optional(),
});

export const addressSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  country: z.string().length(2),
  city: z.string().min(2),
  zip: z.string().optional(),
  line1: z.string().min(3),
  line2: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const tagSchema = z.object({ id: z.string(), name: z.string().min(1), color: z.string().optional() });

export const taskSchema = z.object({
  id: z.string(),
  entityId: z.string(),
  title: z.string().min(3),
  dueAtISO: z.string().optional(),
  done: z.boolean().optional(),
  assigneeId: z.string().optional(),
  notes: z.string().optional(),
});

