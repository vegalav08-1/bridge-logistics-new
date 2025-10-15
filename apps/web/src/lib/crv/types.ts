import type { Role } from '@/lib/order/types';

export type CRStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'APPLIED' | 'ROLLED_BACK';

export type CRField =
  | { key: 'delivery.address'; old?: string; next: string }
  | { key: 'delivery.city'; old?: string; next: string }
  | { key: 'delivery.date'; old?: string; next: string }               // ISO
  | { key: 'pricing.total'; old?: number; next: number; currency: string }
  | { key: 'items.add'; next: Array<{ sku: string; name: string; qty: number; weight?: number }> }
  | { key: 'items.remove'; next: Array<{ sku: string; qty?: number }> }
  | { key: 'meta.note'; next: string }
  // расширяем при необходимости (сверка/упаковка и т.д.)

export type ChangeRequest = {
  id: string;
  orderId: string;
  createdAtISO: string;
  createdBy: string;                     // userId
  status: CRStatus;
  rationale?: string;                    // обоснование
  fields: CRField[];
  approvals: Array<{ by: string; role: Role; atISO: string; decision: 'APPROVE' | 'REJECT'; comment?: string }>;
  appliedAtISO?: string;
  rejectedAtISO?: string;
  baseVersion: number;                   // с какой версии order рассчитан diff
};

export type OrderVersion = {
  orderId: string;
  version: number;                       // монотонно растущая
  atISO: string;
  actorId: string;
  snapshot: Record<string, any>;          // плоская/иерарх. форма заказа
  crId?: string;                         // кто создал
  comment?: string;
};

export type CRVSummary = {
  currentVersion: number;
  hasPending: boolean;
  lastChangeAt?: string;
};

