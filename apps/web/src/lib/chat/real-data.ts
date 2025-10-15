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

export const generatePinnedMessage = (shipment: ShipmentInfo): ChatMessage => {
  return {
    id: `pinned-${shipment.id}`,
    type: 'system',
    content: `📦 **Информация об отгрузке ${shipment.number}**

**👤 Отправитель:** ${shipment.client.name}
**📞 Телефон:** ${shipment.client.phone}
**📧 Email:** ${shipment.client.email}
**📍 Адрес:** ${shipment.client.address}

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
  const now = new Date();
  
  return [
    pinnedMessage,
    {
      id: `welcome-${shipment.id}`,
      type: 'system',
      content: `🎉 **Добро пожаловать в чат отгрузки ${shipment.number}!**

Здесь вы можете отслеживать статус вашей отгрузки, общаться с логистами и получать уведомления о важных событиях.

**Доступные действия:**
• 📋 Просмотр информации об отгрузке (закреплено выше)
• 📞 Связь с логистами
• 📊 Отслеживание статуса
• 📝 Добавление комментариев`,
      timestamp: new Date(now.getTime() + 1000).toISOString(),
      isPinned: false,
      metadata: {
        shipmentId: shipment.id,
        action: 'welcome'
      }
    },
    {
      id: `status-${shipment.id}`,
      type: 'auto',
      content: `📋 **Статус отгрузки обновлен**

Текущий статус: **${shipment.status}**
Время обновления: ${now.toLocaleString('ru-RU')}

Отгрузка создана и ожидает обработки. Наш менеджер свяжется с вами в ближайшее время для уточнения деталей.`,
      timestamp: new Date(now.getTime() + 2000).toISOString(),
      isPinned: false,
      metadata: {
        shipmentId: shipment.id,
        action: 'status_update',
        data: { status: shipment.status }
      }
    }
  ];
};
