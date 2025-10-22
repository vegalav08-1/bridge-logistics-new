import { z } from 'zod';

// Схема для физического лица
export const individualProfileSchema = z.object({
  email: z.string().email(), // Обязательное поле, берется из регистрации
  phone: z.string().min(10, 'Телефон должен содержать минимум 10 цифр'),
  clientCode: z.string().min(3, 'Код клиента должен содержать минимум 3 символа'),
  firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  lastName: z.string().min(2, 'Фамилия должна содержать минимум 2 символа'),
  middleName: z.string().optional(),
  birthDate: z.string().optional(),
  passportNumber: z.string().optional(),
  passportIssuedBy: z.string().optional(),
  passportIssueDate: z.string().optional(),
  address: z.string().min(10, 'Адрес должен содержать минимум 10 символов'),
  city: z.string().min(2, 'Город должен содержать минимум 2 символа'),
  postalCode: z.string().min(5, 'Почтовый индекс должен содержать минимум 5 символов'),
  country: z.string().min(2, 'Страна должна содержать минимум 2 символа'),
});

// Схема для юридического лица
export const legalEntityProfileSchema = z.object({
  email: z.string().email(), // Обязательное поле, берется из регистрации
  phone: z.string().min(10, 'Телефон должен содержать минимум 10 цифр'),
  clientCode: z.string().min(3, 'Код клиента должен содержать минимум 3 символа'),
  companyName: z.string().min(2, 'Название компании должно содержать минимум 2 символа'),
  legalForm: z.string().min(2, 'Правовая форма должна содержать минимум 2 символа'),
  inn: z.string().min(10, 'ИНН должен содержать минимум 10 цифр'),
  kpp: z.string().optional(),
  ogrn: z.string().min(13, 'ОГРН должен содержать минимум 13 цифр'),
  legalAddress: z.string().min(10, 'Юридический адрес должен содержать минимум 10 символов'),
  actualAddress: z.string().min(10, 'Фактический адрес должен содержать минимум 10 символов'),
  city: z.string().min(2, 'Город должен содержать минимум 2 символа'),
  postalCode: z.string().min(5, 'Почтовый индекс должен содержать минимум 5 символов'),
  country: z.string().min(2, 'Страна должна содержать минимум 2 символа'),
  directorName: z.string().min(2, 'ФИО контактного лица должно содержать минимум 2 символа'),
  directorPosition: z.string().min(2, 'Должность контактного лица должна содержать минимум 2 символа'),
});

// Общая схема профиля (для обратной совместимости)
export const profileSchema = z.object({
  companyName: z.string().min(2).optional(),
  contactName: z.string().min(2).optional(),
  phone: z.string().min(6).optional(),
  email: z.string().email().optional(),
  type: z.enum(['individual', 'legal']).optional(),
  // Поля для физического лица
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  birthDate: z.string().optional(),
  passportNumber: z.string().optional(),
  passportIssuedBy: z.string().optional(),
  passportIssueDate: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  clientCode: z.string().optional(),
  // Поля для юридического лица
  legalForm: z.string().optional(),
  inn: z.string().optional(),
  kpp: z.string().optional(),
  ogrn: z.string().optional(),
  legalAddress: z.string().optional(),
  actualAddress: z.string().optional(),
  directorName: z.string().optional(),
  directorPosition: z.string().optional(),
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




