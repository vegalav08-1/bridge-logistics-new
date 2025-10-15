import { z } from 'zod';

export const qtySchema = z.object({
  units: z.number().int().nonnegative(),
  weightKg: z.number().nonnegative().optional(),
  volumeM3: z.number().nonnegative().optional(),
});

export const receivingItemSchema = z.object({
  id: z.string(),
  sku: z.string().optional(),
  name: z.string().optional(),
  expected: qtySchema.optional(),
  received: qtySchema.optional(),
  damage: z.enum(['NONE', 'MINOR', 'MAJOR']).optional(),
  notes: z.string().max(500).optional(),
  sourceLabel: z.string().optional(),
});

export const reconcileDiffSchema = z.object({
  id: z.string(),
  receivingItemId: z.string(),
  type: z.enum(['OVER', 'SHORT', 'MISMATCH']),
  deltaUnits: z.number().int(),
  comment: z.string().optional(),
  resolved: z.boolean().optional(),
});

export const qaIssueSchema = z.object({
  id: z.string(),
  receivingItemId: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  kind: z.enum(['PACKAGING', 'LABEL', 'BROKEN', 'WET', 'OTHER']),
  comment: z.string().optional(),
  resolved: z.boolean().optional(),
});

export const putawayMoveSchema = z.object({
  id: z.string(),
  receivingItemId: z.string(),
  binCode: z.string().min(3),
  qty: qtySchema,
  movedAtISO: z.string(),
  by: z.string(),
});

export const returnCaseSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  reason: z.enum(['USER_REFUSED', 'DEFECT', 'LOST', 'OTHER']),
  initiatedBy: z.enum(['USER', 'ADMIN', 'SYSTEM']),
  createdAtISO: z.string(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'SHIPPED_BACK', 'CLOSED']),
});

