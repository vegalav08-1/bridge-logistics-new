import { z } from 'zod';

/**
 * Client code validation - 3-6 digits
 */
export const clientCodeSchema = z.string().regex(/^\d{3,6}$/, 'Код клиента должен содержать 3-6 цифр');

/**
 * Base profile schema (common fields)
 */
export const profileBaseSchema = z.object({
  phone: z.string().min(5).optional(),
  country: z.string().length(2),
  city: z.string().min(2),
  zip: z.string().optional(),
  address_line1: z.string().min(3),
  address_line2: z.string().optional(),
  lang: z.string().default('ru'),
  currency: z.string().length(3).default('EUR'),
  client_code: clientCodeSchema.optional(),
});

/**
 * Person profile schema (физическое лицо)
 */
export const personSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  date_of_birth: z.string().optional(),     // ISO date
  passport_no: z.string().optional(),
  national_id: z.string().optional(),
});

/**
 * Company profile schema (юридическое лицо)
 */
export const companySchema = z.object({
  company_name: z.string().min(2),
  reg_no: z.string().optional(),
  tax_id: z.string().optional(),
  eori: z.string().optional(),
  bank_name: z.string().optional(),
  iban: z.string().optional(),
  swift: z.string().optional(),
  contact_person: z.string().optional(),
});

/**
 * City schema for settings
 */
export const citySchema = z.object({ 
  defaultCity: z.string().min(2) 
});

/**
 * Combined validation schemas
 */
export const profileSchema = profileBaseSchema;
export const personProfileSchema = personSchema;
export const companyProfileSchema = companySchema;
