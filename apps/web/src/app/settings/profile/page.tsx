'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Building2 } from 'lucide-react';
import { useSettings } from '@/lib/settings/useSettings';
import { IndividualForm } from './components/IndividualForm';
import { LegalEntityForm } from './components/LegalEntityForm';

type ProfileType = 'individual' | 'legal' | null;

export default function ProfileSettings() {
  const router = useRouter();
  const s = useSettings();
  const [profileType, setProfileType] = useState<ProfileType>(null);
  const [loading, setLoading] = useState(false);

  // Получаем email из контекста пользователя (в реальном приложении это будет из auth)
  const userEmail = 'user@example.com'; // Заглушка, в реальности берется из auth context
  
  // Загружаем данные профиля при инициализации (только для восстановления из sessionStorage)
  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const { getUserProfile } = await import('@/lib/profile/user-profile');
        let profile = getUserProfile();
        
        // Если нет профиля в localStorage, проверяем sessionStorage
        if (!profile) {
          const backupProfile = sessionStorage.getItem('user-profile-backup');
          if (backupProfile) {
            try {
              profile = JSON.parse(backupProfile);
              console.log('📦 Профиль восстановлен из sessionStorage:', profile);
              // Восстанавливаем в localStorage
              localStorage.setItem('user-profile', backupProfile);
            } catch (e) {
              console.error('Ошибка парсинга backup профиля:', e);
            }
          }
        }
        
        // НЕ синхронизируем с настройками автоматически - это может перезаписать данные
        // Пользователь должен сам сохранить профиль через форму
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
      }
    };
    
    loadProfile();
  }, []);

  const handleSaveIndividual = async (data: any) => {
    setLoading(true);
    try {
      const profileData = { 
        ...data, 
        type: 'individual' 
      };
      
      // Сохраняем в настройки приложения
      await s.save({ profile: profileData });
      
      // Сохраняем в localStorage для использования в системных сообщениях
      const { saveUserProfile } = await import('@/lib/profile/user-profile');
      saveUserProfile(profileData);
      
      // Дополнительно сохраняем в sessionStorage для надежности
      sessionStorage.setItem('user-profile-backup', JSON.stringify(profileData));
      
      console.log('✅ Профиль физического лица сохранен:', profileData);
      setProfileType(null);
    } catch (error) {
      console.error('Ошибка сохранения данных физического лица:', error);
      alert('Ошибка сохранения данных');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLegal = async (data: any) => {
    setLoading(true);
    try {
      const profileData = { 
        ...data, 
        type: 'legal' 
      };
      
      // Сохраняем в настройки приложения
      await s.save({ profile: profileData });
      
      // Сохраняем в localStorage для использования в системных сообщениях
      const { saveUserProfile } = await import('@/lib/profile/user-profile');
      saveUserProfile(profileData);
      
      // Дополнительно сохраняем в sessionStorage для надежности
      sessionStorage.setItem('user-profile-backup', JSON.stringify(profileData));
      
      console.log('✅ Профиль юридического лица сохранен:', profileData);
      setProfileType(null);
    } catch (error) {
      console.error('Ошибка сохранения данных юридического лица:', error);
      alert('Ошибка сохранения данных');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileType(null);
  };

  // Если выбран тип профиля, показываем соответствующую форму
  if (profileType === 'individual') {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={handleCancel}
            className="h-10 w-10 rounded-xl border grid place-items-center hover:bg-[var(--muted)] transition-colors"
            aria-label="Назад"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Профиль физического лица</h1>
        </div>
        <IndividualForm
          initialData={s.data?.profile}
          onSave={handleSaveIndividual}
          onCancel={handleCancel}
          loading={loading}
          userEmail={userEmail}
        />
      </div>
    );
  }

  if (profileType === 'legal') {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={handleCancel}
            className="h-10 w-10 rounded-xl border grid place-items-center hover:bg-[var(--muted)] transition-colors"
            aria-label="Назад"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Профиль юридического лица</h1>
        </div>
        <LegalEntityForm
          initialData={s.data?.profile}
          onSave={handleSaveLegal}
          onCancel={handleCancel}
          loading={loading}
          userEmail={userEmail}
        />
      </div>
    );
  }

  // Главное меню выбора типа профиля
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => router.back()}
          className="h-10 w-10 rounded-xl border grid place-items-center hover:bg-[var(--muted)] transition-colors"
          aria-label="Назад"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">Профиль</h1>
      </div>

      <div className="space-y-4">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Выберите тип профиля
          </h2>
          <p className="text-gray-600">
            Данные валидируются отдельно для каждого типа профиля
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Физическое лицо */}
          <div 
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-[var(--brand)] hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setProfileType('individual')}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Физическое лицо
                </h3>
                <p className="text-sm text-gray-600">
                  Для индивидуальных клиентов
                </p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Личные данные</li>
              <li>• Паспортные данные</li>
              <li>• Адрес проживания</li>
              <li>• Контактная информация</li>
            </ul>
          </div>

          {/* Юридическое лицо */}
          <div 
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-[var(--brand)] hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setProfileType('legal')}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Юридическое лицо
                </h3>
                <p className="text-sm text-gray-600">
                  Для организаций и компаний
                </p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Реквизиты компании</li>
              <li>• Юридический адрес</li>
              <li>• Данные руководителя</li>
              <li>• Контактная информация</li>
            </ul>
          </div>
        </div>

            {/* Информация о текущем профиле */}
            {s.data?.profile && (
              <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">
                  ✅ Текущий профиль
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {s.data.profile.type === 'individual'
                    ? `Физическое лицо: ${s.data.profile.firstName || ''} ${s.data.profile.lastName || ''}`
                    : `Юридическое лицо: ${s.data.profile.companyName || ''}`
                  }
                </p>
                <div className="text-xs text-gray-500 mb-3">
                  📞 {s.data.profile.phone || 'Не указан'} • 🆔 {s.data.profile.clientCode || 'Не указан'}
                </div>
                <button
                  onClick={() => setProfileType(s.data.profile?.type as 'individual' | 'legal')}
                  className="px-3 py-2 text-sm bg-[var(--brand)] text-white rounded-lg hover:bg-[var(--brand-dark)] transition-colors"
                >
                  ✏️ Редактировать профиль
                </button>
              </div>
            )}

            {/* Информация о том, как данные используются */}
            <div className="mt-8 p-4 bg-green-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">
                ℹ️ Информация о данных профиля
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Все данные, которые вы вводите в профиле, автоматически используются в системных сообщениях чата при создании отгрузки.
              </p>
              <p className="text-sm text-gray-600">
                Данные сохраняются надежно и не заменяются на демо-данные.
              </p>
            </div>
      </div>
    </div>
  );
}
