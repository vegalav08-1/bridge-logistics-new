import type { OrderStatus, TransitionKey, Role } from './types';

export const ORDER_FLOW: OrderStatus[] = [
  'REQUEST', 'NEW', 'RECEIVE', 'PACK', 'MERGE',
  'IN_TRANSIT', 'ON_DELIVERY', 'DELIVERED', 'ARCHIVED'
];

type Transition = {
  from: OrderStatus[];
  to: OrderStatus;
  key: TransitionKey;
  allowedRoles: Role[];        // кто может инициировать
  requires?: Array<'PAYMENT_OK' | 'RECONCILE_OK' | 'PACKED_OK' | 'NO_DEBT'>; // бизнес-гейты
  auto?: boolean;              // автоперевод (вебхук перевозчика и пр.)
};

export const TRANSITIONS: Transition[] = [
  { from: ['REQUEST'], to: 'NEW', key: 'REQUEST_SUBMIT', allowedRoles: ['USER', 'ADMIN'] },
  { from: ['NEW'], to: 'RECEIVE', key: 'RECEIVE_ACCEPT', allowedRoles: ['ADMIN', 'SUPER_ADMIN'] },
  { from: ['RECEIVE'], to: 'PACK', key: 'RECEIVE_FINISH', allowedRoles: ['ADMIN', 'SUPER_ADMIN'], requires: ['RECONCILE_OK'] },
  { from: ['PACK'], to: 'MERGE', key: 'PACK_FINISH', allowedRoles: ['ADMIN', 'SUPER_ADMIN'], requires: ['PACKED_OK'] },
  { from: ['MERGE', 'PACK'], to: 'IN_TRANSIT', key: 'SHIP', allowedRoles: ['ADMIN'], requires: ['NO_DEBT'] },
  { from: ['IN_TRANSIT'], to: 'ON_DELIVERY', key: 'OUT_FOR_DELIVERY', allowedRoles: ['ADMIN'], auto: true },
  { from: ['ON_DELIVERY'], to: 'DELIVERED', key: 'DELIVER', allowedRoles: ['ADMIN', 'USER'] },
  { from: ['DELIVERED'], to: 'ARCHIVED', key: 'ARCHIVE', allowedRoles: ['ADMIN', 'SUPER_ADMIN'] },
  { from: ['REQUEST', 'NEW', 'RECEIVE', 'PACK', 'MERGE', 'IN_TRANSIT', 'ON_DELIVERY'], to: 'CANCELLED', key: 'CANCEL', allowedRoles: ['ADMIN', 'SUPER_ADMIN'] },
];
