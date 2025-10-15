import { z } from 'zod';

export const createLinkSchema = z.object({
  note: z.string().max(120).optional()  // просто подпись для себя
});

export const joinByTokenSchema = z.object({
  urlOrToken: z.string().min(6)         // полная ссылка или токен
});

