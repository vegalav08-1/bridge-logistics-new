import { z } from 'zod';

export const receivePartialSchema = z.object({
  comment: z.string().optional(),
  lines: z.array(z.object({
    id: z.string(),
    qtyAccepted: z.number().nonnegative(),
  })).min(1),
});

export const deliverPartialSchema = z.object({
  comment: z.string().optional(),
  recipientName: z.string().min(2),
  docNumber: z.string().min(1),
  lines: z.array(z.object({
    id: z.string(),
    qtyDelivered: z.number().nonnegative(),
  })).min(1),
});

export const splitSchema = z.object({
  newTitle: z.string().min(1).max(120).optional(),
  picks: z.array(z.object({
    id: z.string(),
    qty: z.number().positive(),
  })).min(1),
});

export const mergeAttachSchema = z.object({
  targetChatId: z.string(),
  picks: z.array(z.object({
    id: z.string(),
    qty: z.number().positive(),
  })).optional(),
});

export const confirmSchema = z.object({
  comment: z.string().optional(),
});

export type ReceivePartialInput = z.infer<typeof receivePartialSchema>;
export type DeliverPartialInput = z.infer<typeof deliverPartialSchema>;
export type SplitInput = z.infer<typeof splitSchema>;
export type MergeAttachInput = z.infer<typeof mergeAttachSchema>;
export type ConfirmInput = z.infer<typeof confirmSchema>;


