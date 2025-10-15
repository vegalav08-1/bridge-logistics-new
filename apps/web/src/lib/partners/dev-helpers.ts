import { setMockRole } from './api';

// Dev helper для переключения ролей в development
export function initDevHelpers() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Добавляем глобальные функции для тестирования
    (window as any).setPartnersRole = (role: 'USER' | 'ADMIN' | 'SUPER_ADMIN') => {
      setMockRole(role);
      console.log(`Role switched to: ${role}`);
      // Перезагружаем страницу для применения изменений
      window.location.reload();
    };
    
    console.log('Partners dev helpers loaded. Use setPartnersRole("USER") or setPartnersRole("ADMIN") to switch roles');
  }
}

