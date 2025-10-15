import type { PartnersPayload, ReferralLink, PartnerInfo, ShipmentListItem } from './types';

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

let LINKS: ReferralLink[] = [];   // dev-memory
let RELS: PartnersPayload = {
  meRole: 'ADMIN',
  partners: [
    { 
      id: 'u_1345', 
      handle: 'Partner_1345', 
      fullName: 'Ivanov Ivan', 
      role: 'USER', 
      relation: 'referral_of_me', 
      joinedAtISO: new Date().toISOString(), 
      chatId: 'chat_1345', 
      unread: 0 
    },
    { 
      id: 'u_1445', 
      handle: 'Partner_1445', 
      fullName: 'Petrov Petr', 
      role: 'USER', 
      relation: 'referral_of_me', 
      joinedAtISO: new Date().toISOString(), 
      chatId: 'chat_1445', 
      unread: 3 
    },
  ]
};

export async function fetchPartners(): Promise<PartnersPayload> {
  await wait(150);
  return structuredClone(RELS);
}

export async function searchPartners(q: string): Promise<PartnersPayload> {
  await wait(80);
  const up = q.trim().toLowerCase();
  if (!up) return fetchPartners();
  const filtered = RELS.partners.filter(p =>
    p.handle.toLowerCase().includes(up) || (p.fullName || '').toLowerCase().includes(up)
  );
  return { ...RELS, partners: filtered };
}

export async function createReferralLink(note?: string): Promise<ReferralLink> {
  await wait(100);
  const link: ReferralLink = { 
    token: Math.random().toString(36).slice(2), 
    inviterId: 'me', 
    inviterRole: RELS.meRole, 
    createdAtISO: new Date().toISOString(), 
    note 
  };
  LINKS = [link, ...LINKS];
  return link;
}

// Принимаем токен — в реальном бэке тут будет проверка и запись связи.
// Здесь добавим моковую связь: если я USER — присоединяюсь к ADMIN,
// если я ADMIN — имитируем, что ко мне присоединился новый USER.
export async function joinByReferral(token: string): Promise<{ ok: true; joinedId: string }> {
  await wait(150);
  const link = LINKS.find(l => l.token === token);
  if (!link) throw new Error('Invalid token');
  
  // мок добавления
  const joinedId = 'u_' + Math.floor(Math.random() * 10000);
  const newPartner = link.inviterRole === 'ADMIN'
    ? { 
        id: link.inviterId, 
        handle: 'Admin_1001', 
        fullName: 'Admin Name', 
        role: 'ADMIN' as const, 
        relation: 'admin_of_me' as const, 
        joinedAtISO: new Date().toISOString(), 
        chatId: 'chat_admin', 
        unread: 0 
      }
    : { 
        id: joinedId, 
        handle: 'Partner_' + joinedId.slice(-4), 
        fullName: 'New User', 
        role: 'USER' as const, 
        relation: 'referral_of_me' as const, 
        joinedAtISO: new Date().toISOString(), 
        chatId: 'chat_' + joinedId, 
        unread: 0 
      };

  // если я USER — список должен содержать админов
  if (RELS.meRole === 'USER') {
    const exists = RELS.partners.some(p => p.id === newPartner.id);
    if (!exists) RELS.partners = [newPartner, ...RELS.partners];
  } else {
    RELS.partners = [newPartner, ...RELS.partners];
  }
  return { ok: true, joinedId: newPartner.id };
}

// Dev helper для смены роли
export function setMockRole(role: 'USER' | 'ADMIN' | 'SUPER_ADMIN') {
  RELS.meRole = role;
  if (role === 'USER') {
    // Для USER показываем список админов
    RELS.partners = [
      { 
        id: 'admin_1', 
        handle: 'Admin_1001', 
        fullName: 'Admin Name', 
        role: 'ADMIN', 
        relation: 'admin_of_me', 
        joinedAtISO: new Date().toISOString(), 
        chatId: 'chat_admin', 
        unread: 2 
      }
    ];
  } else {
    // Для ADMIN показываем список рефералов
    RELS.partners = [
      { 
        id: 'u_1345', 
        handle: 'Partner_1345', 
        fullName: 'Ivanov Ivan', 
        role: 'USER', 
        relation: 'referral_of_me', 
        joinedAtISO: new Date().toISOString(), 
        chatId: 'chat_1345', 
        unread: 0 
      },
      { 
        id: 'u_1445', 
        handle: 'Partner_1445', 
        fullName: 'Petrov Petr', 
        role: 'USER', 
        relation: 'referral_of_me', 
        joinedAtISO: new Date().toISOString(), 
        chatId: 'chat_1445', 
        unread: 3 
      }
    ];
  }
}

// ===== PARTNER SHIPMENTS API =====

/** Guard: проверяет, связан ли текущий пользователь с partnerId по рефералке */
export async function ensureReferralRelation(partnerId: string): Promise<{ ok: true; relation: 'admin_of_me' | 'referral_of_me'; meRole: 'USER' | 'ADMIN' | 'SUPER_ADMIN' }> {
  await wait(60);
  // вернём фиктивные данные; в реале — 403 при отсутствии связи
  return { ok: true, relation: 'referral_of_me', meRole: 'ADMIN' };
}

/** Информация о партнёре + сводка */
export async function getPartnerInfo(partnerId: string): Promise<PartnerInfo> {
  await wait(100);
  return {
    id: partnerId,
    handle: 'Partner_' + partnerId.slice(-4),
    fullName: 'Ivanov Ivan',
    role: 'USER',
    relation: 'referral_of_me',
    joinedAtISO: new Date().toISOString(),
    stats: { shipments: 24, unread: 3, debt: 0 },
  };
}

/** Список отгрузок по партнёру, с фильтрами и пагинацией */
export async function listPartnerShipments(partnerId: string, params: {
  q?: string;                 // строка поиска
  status?: string[];          // фильтр по статусам
  cursor?: string | null;       // пагинация (ISO/ID)
  limit?: number;             // размер страницы
}): Promise<{ items: ShipmentListItem[]; nextCursor: string | null }> {
  await wait(150);
  const now = Date.now();
  const items = Array.from({ length: params.limit ?? 20 }).map((_, i) => ({
    id: 'shp_' + ((params.cursor ? Number(params.cursor) : 0) + (i + 1)),
    number: 'BR-' + String(1000 + (i)).padStart(6, '0'),
    status: (i % 2 ? 'PACK' : 'RECONCILE') as ShipmentListItem['status'],
    updatedAtISO: new Date(now - (i * 36e5)).toISOString(),
    unread: i % 3 === 0 ? (i % 2 ? 2 : 1) : 0,
    debt: i % 5 === 0 ? 1200 : 0,
    title: 'Shipment to Moscow'
  }));
  return { items, nextCursor: items.length ? String((params.cursor ? Number(params.cursor) : 0) + items.length) : null };
}