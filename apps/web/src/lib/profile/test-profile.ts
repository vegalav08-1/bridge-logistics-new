/**
 * Тестовые данные профиля для демонстрации
 */

import { UserProfile } from './user-profile';

// Тестовый профиль физического лица
export const testIndividualProfile: UserProfile = {
  type: 'individual',
  email: 'ivan.petrov@example.com',
  phone: '+7 (999) 123-45-67',
  clientCode: 'BR12345',
  firstName: 'Иван',
  lastName: 'Петров',
  middleName: 'Сергеевич',
  address: 'г. Санкт-Петербург, ул. Невский проспект, д. 1, кв. 10',
  city: 'Санкт-Петербург',
  postalCode: '191025',
  country: 'Россия',
  birthDate: '1985-03-15',
  passportNumber: '1234 567890',
  passportIssuedBy: 'ОТДЕЛЕНИЕМ УФМС РОССИИ ПО Г. САНКТ-ПЕТЕРБУРГУ',
  passportIssueDate: '2010-05-20'
};

// Тестовый профиль юридического лица
export const testLegalProfile: UserProfile = {
  type: 'legal',
  email: 'info@company.ru',
  phone: '+7 (812) 555-12-34',
  clientCode: 'BR67890',
  companyName: 'ООО "Логистические решения"',
  legalForm: 'ООО',
  inn: '1234567890',
  kpp: '123456789',
  ogrn: '1234567890123',
  legalAddress: 'г. Санкт-Петербург, ул. Литейный проспект, д. 15, офис 201',
  actualAddress: 'г. Санкт-Петербург, ул. Литейный проспект, д. 15, офис 201',
  city: 'Санкт-Петербург',
  postalCode: '191028',
  country: 'Россия',
  directorName: 'Петров Иван Сергеевич',
  directorPosition: 'Генеральный директор'
};

/**
 * Инициализирует тестовый профиль в localStorage
 */
export function initTestProfile(profileType: 'individual' | 'legal' = 'individual'): void {
  const profile = profileType === 'individual' ? testIndividualProfile : testLegalProfile;
  
  // Сохраняем в localStorage
  localStorage.setItem('user-profile', JSON.stringify(profile));
  
  console.log(`✅ Тестовый профиль ${profileType} инициализирован:`, profile);
}

/**
 * Очищает профиль из localStorage
 */
export function clearTestProfile(): void {
  localStorage.removeItem('user-profile');
  console.log('🗑️ Профиль очищен из localStorage');
}
