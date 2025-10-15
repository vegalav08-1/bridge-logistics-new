import { z } from 'zod';

export const messageTextSchema = z.string().max(5000);
export const mentionSchema = z.object({
  userId: z.string(),
  from: z.number().int().nonnegative(),
  to: z.number().int().nonnegative(),
});
export const chatSettingsSchema = z.object({
  muteAll: z.boolean().optional(),
  allowMentionsOverride: z.boolean().optional(),
  allowExternalInvite: z.boolean().optional(),
});
export const participantSchema = z.object({
  userId: z.string(),
  role: z.enum(['USER','ADMIN','SUPER_ADMIN']),
  muted: z.boolean().optional(),
  joinedAtISO: z.string(),
  displayName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

