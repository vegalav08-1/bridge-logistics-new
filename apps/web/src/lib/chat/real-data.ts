/**
 * Реальные данные для чата и отгрузки
 */

export interface ShipmentInfo {
  id: string;
  number: string;
  status: 'NEW' | 'RECEIVE' | 'PACK' | 'MERGE' | 'IN_TRANSIT' | 'ON_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  title: string;
  subtitle?: string;
  createdAt: string;
  updatedAt: string;
  client: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    weight: number;
    dimensions: string;
    description?: string;
  }[];
  totalWeight: number;
  totalVolume: number;
  estimatedValue: number;
  specialInstructions?: string;
  trackingNumber?: string;
  deliveryAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    contactPerson: string;
    phone: string;
  };
}

export interface ChatMessage {
  id: string;
  type: 'system' | 'user' | 'admin' | 'auto';
  content: string;
  timestamp: string;
  sender?: {
    name: string;
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    avatar?: string;
  };
  isPinned?: boolean;
  quotedMessage?: ChatMessage;
  attachments?: Array<{
    id: string;
    fileName: string;
    name: string;
    size: number;
    mimeType: string;
    type: string;
    url: string;
    downloadUrl: string;
  }>;
  metadata?: {
    shipmentId?: string;
    action?: string;
    data?: any;
  };
}

export const generateRealShipmentData = (chatId: string): ShipmentInfo => {
  const now = new Date();
  const createdAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Случайная дата в последние 7 дней
  
  return {
    id: chatId,
    number: `BR-${chatId.slice(-6).toUpperCase()}`,
    status: 'NEW',
    title: 'Отгрузка электроники и аксессуаров',
    subtitle: 'Срочная доставка в Москву',
    createdAt: createdAt.toISOString(),
    updatedAt: now.toISOString(),
    client: {
      name: 'Иван Петров',
      phone: '+7 (999) 123-45-67',
      email: 'ivan.petrov@example.com',
      address: 'г. Санкт-Петербург, ул. Невский проспект, д. 1'
    },
    items: [
      {
        id: 'item-1',
        name: 'Ноутбук MacBook Pro 16"',
        quantity: 1,
        weight: 2.0,
        dimensions: '35.6 x 24.8 x 1.7 см',
        description: 'Серый космос, 512GB SSD, 16GB RAM'
      },
      {
        id: 'item-2',
        name: 'Мышь Magic Mouse',
        quantity: 2,
        weight: 0.1,
        dimensions: '11.3 x 5.7 x 3.2 см',
        description: 'Белая, беспроводная'
      },
      {
        id: 'item-3',
        name: 'Клавиатура Magic Keyboard',
        quantity: 1,
        weight: 0.23,
        dimensions: '27.9 x 11.4 x 0.4 см',
        description: 'Русская раскладка, беспроводная'
      }
    ],
    totalWeight: 2.53,
    totalVolume: 0.15,
    estimatedValue: 250000,
    specialInstructions: 'Хрупкий груз. Требуется осторожная транспортировка.',
    deliveryAddress: {
      street: 'ул. Тверская, д. 15, кв. 42',
      city: 'Москва',
      postalCode: '125009',
      country: 'Россия',
      contactPerson: 'Анна Смирнова',
      phone: '+7 (495) 123-45-67'
    }
  };
};

// Новая функция для генерации системного сообщения на основе данных формы и профиля
export const generateShipmentSystemMessage = (formData: any, userProfile: any): ChatMessage => {
  const now = new Date();
  
  // Формируем информацию об отправителе на основе профиля
  let senderInfo = '';
  let contactInfo = '';
  let addressInfo = '';
  
  if (userProfile) {
    if (userProfile.type === 'individual') {
      senderInfo = `**👤 Отправитель:** ${userProfile.firstName} ${userProfile.lastName}`;
      contactInfo = `**📞 Телефон:** ${userProfile.phone}\n**📧 Email:** ${userProfile.email}`;
      if (userProfile.clientCode) {
        contactInfo += `\n**🔢 Номер клиента:** ${userProfile.clientCode}`;
      }
      addressInfo = `**📍 Адрес:** ${userProfile.address}, ${userProfile.city}, ${userProfile.postalCode}, ${userProfile.country}`;
    } else if (userProfile.type === 'legal') {
      senderInfo = `**🏢 Организация:** ${userProfile.companyName}`;
      contactInfo = `**👤 Контактное лицо:** ${userProfile.contactPersonName}\n**💼 Должность:** ${userProfile.contactPersonPosition}\n**📞 Телефон:** ${userProfile.phone}\n**📧 Email:** ${userProfile.email}`;
      if (userProfile.clientCode) {
        contactInfo += `\n**🔢 Номер клиента:** ${userProfile.clientCode}`;
      }
      addressInfo = `**📍 Юридический адрес:** ${userProfile.legalAddress}\n**📍 Фактический адрес:** ${userProfile.actualAddress}`;
    }
  } else {
    // Fallback данные
    senderInfo = `**👤 Отправитель:** Пользователь`;
    contactInfo = `**📧 Email:** user@example.com`;
    addressInfo = `**📍 Адрес:** Не указан`;
  }

  // Формируем информацию о товарах
  const itemsInfo = formData.items && formData.items.length > 0 
    ? formData.items.map((item: any, index: number) => 
        `• ${item.name || `Товар ${index + 1}`} (${item.quantity || 0} шт.) - ${(item.price || 0).toLocaleString('ru-RU')} ₽`
      ).join('\n')
    : 'Товары не указаны';

  // Формируем информацию о посылках
  const boxesInfo = formData.boxes && formData.boxes.length > 0
    ? formData.boxes.map((box: any, index: number) => {
        const volume = (box.dimensions?.length || 0) * (box.dimensions?.width || 0) * (box.dimensions?.height || 0) / 1000000;
        const weight = box.weight || 0;
        return `• ${box.name || `Посылка ${index + 1}`}: ${box.dimensions?.length || 0}×${box.dimensions?.width || 0}×${box.dimensions?.height || 0} см, ${weight} кг (${volume.toFixed(3)} м³)`;
      }).join('\n')
    : 'Посылки не указаны';

  // Формируем общие характеристики
  const totalWeight = formData.boxes?.reduce((total, box) => total + (box.weight || 0), 0) || 0;
  const totalVolume = formData.totalVolumeM3 || 0;
  const totalCost = formData.totalCost || 0;
  const boxesCount = formData.boxes?.length || 0;

  return {
    id: `shipment-${Date.now()}`,
    type: 'system',
    content: `📦 **Информация об отгрузке**

${senderInfo}

${contactInfo}

${addressInfo}

**📦 Товары:**
${itemsInfo}

**📦 Посылки:**
${boxesInfo}

**📊 Общие характеристики:**
• Общий вес: ${totalWeight} кг
• Количество коробок: ${boxesCount} шт.
• Общий объем: ${totalVolume.toFixed(3)} м³
• Общая стоимость: ${totalCost.toLocaleString('ru-RU')} ₽

**🎯 Адрес прибытия:**
${formData.arrivalAddress || 'Не указан'}

**📝 Описание:**
${formData.shortDesc || 'Не указано'}

**📅 Создано:** ${now.toLocaleString('ru-RU')}`,
    timestamp: now.toISOString(),
    isPinned: true,
    metadata: {
      action: 'shipment_info',
      data: {
        formData,
        userProfile,
        createdAt: now.toISOString()
      }
    }
  };
};

export const generatePinnedMessage = (shipment: ShipmentInfo): ChatMessage => {
  // Импортируем функцию для получения данных профиля
  const { getProfileForSystemMessage } = require('@/lib/profile/user-profile');
  
  // Получаем данные профиля пользователя
  const profileData = getProfileForSystemMessage();
  
  // Формируем информацию об отправителе на основе профиля или fallback данных
  let senderInfo = '';
  let contactInfo = '';
  let addressInfo = '';
  
  if (profileData) {
    // Используем данные из профиля пользователя
    senderInfo = profileData.senderInfo;
    contactInfo = profileData.contactInfo;
    addressInfo = profileData.addressInfo;
  } else {
    // Fallback на старые данные из shipment
    senderInfo = `**👤 Отправитель:** ${shipment.client.name}`;
    contactInfo = `**📞 Телефон:** ${shipment.client.phone}\n**📧 Email:** ${shipment.client.email}`;
    addressInfo = `**📍 Адрес:** ${shipment.client.address}`;
  }

  return {
    id: `pinned-${shipment.id}`,
    type: 'system',
    content: `📦 **Информация об отгрузке ${shipment.number}**

${senderInfo}

${contactInfo}

${addressInfo}

**📦 Содержимое:**
${shipment.items.map(item => 
  `• ${item.name} (${item.quantity} шт.) - ${item.weight} кг`
).join('\n')}

**📊 Общие характеристики:**
• Общий вес: ${shipment.totalWeight} кг
• Общий объем: ${shipment.totalVolume} м³
• Оценочная стоимость: ${shipment.estimatedValue.toLocaleString('ru-RU')} ₽

**🎯 Адрес доставки:**
${shipment.deliveryAddress.contactPerson}
${shipment.deliveryAddress.street}
${shipment.deliveryAddress.city}, ${shipment.deliveryAddress.postalCode}
📞 ${shipment.deliveryAddress.phone}

**⚠️ Особые указания:**
${shipment.specialInstructions || 'Нет особых указаний'}

**📅 Создано:** ${new Date(shipment.createdAt).toLocaleString('ru-RU')}
**🔄 Обновлено:** ${new Date(shipment.updatedAt).toLocaleString('ru-RU')}`,
    timestamp: shipment.createdAt,
    isPinned: true,
    metadata: {
      shipmentId: shipment.id,
      action: 'shipment_info',
      data: shipment
    }
  };
};

export const generateInitialMessages = (shipment: ShipmentInfo): ChatMessage[] => {
  const pinnedMessage = generatePinnedMessage(shipment);
  
  return [
    pinnedMessage
  ];
};
