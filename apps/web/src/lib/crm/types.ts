export type EntityKind = 'USER' | 'PARTNER';

export type Contact = {
  id: string;
  kind: 'PHONE' | 'EMAIL' | 'TELEGRAM' | 'WHATSAPP' | 'OTHER';
  value: string;
  primary?: boolean;
  verified?: boolean;
};

export type Address = {
  id: string;
  label?: string;          // "Дом", "Офис"
  country: string;         // ISO2
  city: string;
  zip?: string;
  line1: string;
  line2?: string;
  isDefault?: boolean;
};

export type Tag = { id: string; name: string; color?: string };

export type SegmentKey =
  | 'NEWBIE'                 // новый клиент < 30 дней
  | 'REPEATER'               // сделал >=2 отгрузок
  | 'VIP'                    // LTV > threshold
  | 'DEBTOR'                 // есть долг по S13
  | 'INACTIVE'               // нет активностей > N дней
  | 'REF_ADMIN'              // реферал администратора
  | 'REF_USER';              // реферал пользователя

export type CRMProfile = {
  id: string;
  kind: EntityKind;
  displayName: string;
  avatarUrl?: string;
  createdAtISO: string;
  referredBy?: { id: string; kind: EntityKind } | null; // из /partners
  contacts: Contact[];
  addresses: Address[];
  tags: Tag[];
  notes?: string;           // свободная заметка
  meta?: Record<string, any>;
};

export type KPI = {
  ltv: number;              // Lifetime Value
  arpu: number;             // avg revenue per order (user) / per client (partner)
  ordersCount: number;
  openShipments: number;
  lastActivityISO?: string;
  debt?: { amount: number; currency: string }; // из S13
};

export type TimelineEvent = {
  id: string;
  atISO: string;
  type: 'order' | 'status' | 'payment' | 'message' | 'file' | 'task' | 'system';
  title: string;
  subtitle?: string;
  ref?: { type: 'shipment' | 'chat' | 'invoice' | 'task'; id: string };
  meta?: Record<string, any>;
};

export type Task = {
  id: string;
  entityId: string;            // CRMProfile.id
  title: string;
  dueAtISO?: string;
  done?: boolean;
  assigneeId?: string;         // назначенный сотрудник
  createdAtISO: string;
  notes?: string;
};

