import type { SLAStage, OrderStatus, Role } from './types';

export const SLA_STAGES: SLAStage[] = [
  { key: 'RECEIVE:complete', status: 'RECEIVE', targetHours: 12, hardLimitHours: 24, escalateTo: ['ADMIN', 'SUPER'] },
  { key: 'RECONCILE:complete', status: 'RECONCILE', targetHours: 24, hardLimitHours: 48, escalateTo: ['ADMIN', 'SUPER'] },
  { key: 'PACK:complete', status: 'PACK', targetHours: 24, hardLimitHours: 48, escalateTo: ['ADMIN', 'SUPER'] },
  { key: 'DELIVERY:handover', status: 'ON_DELIVERY', targetHours: 72, hardLimitHours: 96, escalateTo: ['ADMIN', 'SUPER'] },
];

