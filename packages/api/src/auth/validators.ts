import { z } from 'zod';

export const emailSchema = z.string().email().transform((e) => e.toLowerCase().trim());
export const passwordSchema = z.string().min(8).max(128);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  refAdminId: z.string().optional(),
  refToken: z.string().optional()
});

export const loginSchema = z.object({ 
  email: emailSchema, 
  password: z.string() 
});

export const tokenSchema = z.object({ 
  token: z.string().min(24) 
});

export const resetSchema = z.object({ 
  token: z.string().min(24), 
  newPassword: passwordSchema 
});
