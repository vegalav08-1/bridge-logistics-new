export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export type Partner = {
  id: string;
  handle: string;            // Partner_1345
  fullName?: string;         // Ivanov Ivan
  role: Role;                // роль ЭТОГО партнера
  relation: 'admin_of_me' | 'referral_of_me'; // как связан со МНОЙ
  joinedAtISO: string;
  chatId?: string;           // общий чат с ним (если есть)
  unread?: number;           // непрочитанные в этом чате
};

export type PartnersPayload = {
  meRole: Role;
  partners: Partner[];       // для USER: список админов; для ADMIN: список рефералов
};

export type ReferralLink = {
  token: string;
  inviterId: string;
  inviterRole: Role;         // обычно ADMIN
  createdAtISO: string;
  note?: string;
};

export type PartnerInfo = {
  id: string;
  handle: string;
  fullName?: string;
  role: Role;          // роль партнёра
  relation: 'admin_of_me' | 'referral_of_me';  // как связан со мной
  joinedAtISO: string;
  avatarUrl?: string;
  chatId?: string;     // общий чат «мы↔он» (если единый), опционально
  stats?: { shipments: number; unread: number; debt: number };
};

export type ShipmentListItem = {
  id: string;                // shipmentId / chatId
  number: string;            // BR-000123
  status:
    | 'REQUEST' | 'NEW' | 'RECEIVE' | 'RECONCILE' | 'PACK' | 'MERGE' | 'IN_TRANSIT' | 'ON_DELIVERY' | 'DELIVERED' | 'ARCHIVED' | 'CANCELLED';
  updatedAtISO: string;      // для сортировки
  unread?: number;           // непрочитанные по этому чату
  debt?: number;             // долг по S13
  title?: string;            // краткий заголовок
};