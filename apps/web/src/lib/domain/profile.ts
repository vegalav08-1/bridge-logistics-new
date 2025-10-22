import { z } from 'zod';

/**
 * Client code validation - 3-6 digits
 */
export const clientCodeSchema = z.string().regex(/^\d{3,6}$/, 'Код клиента должен содержать 3-6 цифр');

/**
 * Base profile schema (common fields)
 */
export const profileBaseSchema = z.object({
  phone: z.string().min(5, 'Телефон должен содержать минимум 5 символов').optional(),
  country: z.string().length(2, 'Код страны должен содержать 2 символа'),
  city: z.string().min(2, 'Город должен содержать минимум 2 символа'),
  zip: z.string().optional(),
  address_line1: z.string().min(3, 'Адрес должен содержать минимум 3 символа'),
  address_line2: z.string().optional(),
  lang: z.string().default('ru'),
  currency: z.string().length(3).default('EUR'),
  client_code: clientCodeSchema.optional(),
});

/**
 * Person profile schema (физическое лицо)
 */
export const personSchema = z.object({
  first_name: z.string().min(1, 'Имя обязательно'),
  last_name: z.string().min(1, 'Фамилия обязательна'),
  date_of_birth: z.string().optional(), // ISO date
  passport_no: z.string().optional(),
  national_id: z.string().optional(),
});

/**
 * Company profile schema (юридическое лицо)
 */
export const companySchema = z.object({
  company_name: z.string().min(2, 'Название компании должно содержать минимум 2 символа'),
  reg_no: z.string().optional(),
  tax_id: z.string().optional(),
  eori: z.string().optional(),
  bank_name: z.string().optional(),
  iban: z.string().optional(),
  swift: z.string().optional(),
  contact_person: z.string().optional(),
});

/**
 * Combined profile types
 */
export type ProfileBase = z.infer<typeof profileBaseSchema>;
export type PersonProfile = z.infer<typeof personSchema>;
export type CompanyProfile = z.infer<typeof companySchema>;

export type ProfileKind = 'PERSON' | 'COMPANY';

/**
 * Full profile with kind discrimination
 */
export type FullProfile = {
  id: string;
  email: string; // read-only
  kind: ProfileKind;
  base: ProfileBase;
  person?: PersonProfile;
  company?: CompanyProfile;
  created_at: string;
  updated_at: string;
};

/**
 * Profile creation/update DTOs
 */
export type CreateProfileRequest = {
  kind: ProfileKind;
  base: ProfileBase;
  person?: PersonProfile;
  company?: CompanyProfile;
};

export type UpdateProfileRequest = Partial<CreateProfileRequest>;

/**
 * Company document types
 */
export type CompanyDocument = {
  id: string;
  type: 'CHARTER' | 'EXTRACT' | 'VAT_CERTIFICATE' | 'OTHER';
  filename: string;
  url: string;
  uploaded_at: string;
};

/**
 * Client code generation/validation
 */
export type ClientCodeRequest = {
  value?: string; // if provided, validate; if not, generate
};

export type ClientCodeResponse = {
  code: string;
  available: boolean;
};
