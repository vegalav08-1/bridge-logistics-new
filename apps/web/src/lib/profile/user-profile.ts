/**
 * Утилиты для работы с профилем пользователя
 */

export interface UserProfile {
  type: 'individual' | 'legal';
  email: string;
  phone: string;
  clientCode: string;
  // Поля для физического лица
  firstName?: string;
  lastName?: string;
  middleName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  // Поля для юридического лица
  companyName?: string;
  legalForm?: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
  legalAddress?: string;
  actualAddress?: string;
  directorName?: string;
  directorPosition?: string;
}

/**
 * Получает данные профиля пользователя из localStorage, sessionStorage или API
 */
export function getUserProfile(): UserProfile | null {
  try {
    // Сначала пытаемся получить из localStorage
    let stored = localStorage.getItem('user-profile');
    if (stored) {
      const profile = JSON.parse(stored);
      console.log('📦 Профиль загружен из localStorage:', profile);
      return profile;
    }
    
    // Если нет в localStorage, проверяем sessionStorage
    stored = sessionStorage.getItem('user-profile-backup');
    if (stored) {
      const profile = JSON.parse(stored);
      console.log('📦 Профиль загружен из sessionStorage:', profile);
      // Восстанавливаем в localStorage
      localStorage.setItem('user-profile', stored);
      return profile;
    }
    
    // Если нет нигде, возвращаем null
    // В реальном приложении здесь был бы запрос к API
    return null;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
}

/**
 * Сохраняет данные профиля пользователя в localStorage и sessionStorage
 */
export function saveUserProfile(profile: UserProfile): void {
  try {
    const profileJson = JSON.stringify(profile);
    
    // Сохраняем в localStorage (основное хранилище)
    localStorage.setItem('user-profile', profileJson);
    
    // Сохраняем в sessionStorage (резервная копия)
    sessionStorage.setItem('user-profile-backup', profileJson);
    
    console.log('💾 Профиль сохранен в localStorage и sessionStorage:', profile);
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

/**
 * Форматирует данные профиля для отображения в системных сообщениях
 */
export function formatProfileForSystemMessage(profile: UserProfile): {
  senderName: string;
  senderInfo: string;
  contactInfo: string;
  addressInfo: string;
} {
  if (profile.type === 'individual') {
    // Физическое лицо
    const fullName = [profile.firstName, profile.middleName, profile.lastName]
      .filter(Boolean)
      .join(' ');
    
    return {
      senderName: fullName || 'Физическое лицо',
      senderInfo: `**👤 Отправитель:** ${fullName || 'Физическое лицо'}`,
      contactInfo: `**📞 Телефон:** ${profile.phone}\n**📧 Email:** ${profile.email}\n**🆔 Код клиента:** ${profile.clientCode}`,
      addressInfo: `**📍 Адрес:** ${profile.address || 'Не указан'}\n**🏙️ Город:** ${profile.city || 'Не указан'}\n**📮 Индекс:** ${profile.postalCode || 'Не указан'}\n**🌍 Страна:** ${profile.country || 'Не указана'}`
    };
  } else {
    // Юридическое лицо
    return {
      senderName: profile.companyName || 'Юридическое лицо',
      senderInfo: `**🏢 Отправитель:** ${profile.companyName || 'Юридическое лицо'}`,
      contactInfo: `**📞 Телефон:** ${profile.phone}\n**📧 Email:** ${profile.email}\n**🆔 Код клиента:** ${profile.clientCode}`,
      addressInfo: `**📍 Юридический адрес:** ${profile.legalAddress || 'Не указан'}\n**🏠 Фактический адрес:** ${profile.actualAddress || 'Не указан'}\n**🏙️ Город:** ${profile.city || 'Не указан'}\n**📮 Индекс:** ${profile.postalCode || 'Не указан'}\n**🌍 Страна:** ${profile.country || 'Не указана'}`
    };
  }
}

/**
 * Получает данные профиля и форматирует их для системного сообщения
 */
export function getProfileForSystemMessage(): {
  senderName: string;
  senderInfo: string;
  contactInfo: string;
  addressInfo: string;
} | null {
  const profile = getUserProfile();
  if (!profile) {
    return null;
  }
  
  return formatProfileForSystemMessage(profile);
}
