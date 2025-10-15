import { z } from 'zod';
import { FLAGS } from '@yp/shared';

// Статусы отгрузок (переименованы для избежания конфликтов)
export const STATE_SHIPMENT_STATUSES = {
  REQUEST: 'REQUEST',
  NEW: 'NEW',
  RECEIVE: 'RECEIVE',
  RECONCILE: 'RECONCILE',
  PACK: 'PACK',
  MERGE: 'MERGE',
  IN_TRANSIT: 'IN_TRANSIT',
  ON_DELIVERY: 'ON_DELIVERY',
  DELIVERED: 'DELIVERED',
  ARCHIVED: 'ARCHIVED',
  CANCELLED: 'CANCELLED',
} as const;

export type StateShipmentStatus = typeof STATE_SHIPMENT_STATUSES[keyof typeof STATE_SHIPMENT_STATUSES];

// Действия (операции)
export const LOGISTICS_ACTIONS = {
  // Приёмка
  RECEIVE_FULL: 'receive.full',
  RECEIVE_PARTIAL: 'receive.partial',
  
  // Сверка
  RECONCILE_CREATE: 'reconcile.create',
  RECONCILE_CONFIRM: 'reconcile.confirm',
  
  // Упаковка
  PACK_CONFIGURE: 'pack.configure',
  PACK_COMPLETE: 'pack.complete',
  
  // Совмещение
  MERGE_ATTACH: 'merge.attach',
  MERGE_DETACH: 'merge.detach',
  MERGE_COMPLETE: 'merge.complete',
  
  // Транзит
  ARRIVAL_CITY: 'arrival.city',
  
  // Выдача
  HANDOVER_CONFIRM: 'handover.confirm',
  
  // Управление
  CANCEL: 'cancel',
  ARCHIVE: 'archive',
} as const;

export type LogisticsAction = typeof LOGISTICS_ACTIONS[keyof typeof LOGISTICS_ACTIONS];

// Роли пользователей (переименованы для избежания конфликтов)
export const STATE_USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type StateUserRole = typeof STATE_USER_ROLES[keyof typeof STATE_USER_ROLES];

// Граф переходов: Map<fromStatus, Map<action, toStatus>>
export const STATE_TRANSITIONS: Record<StateShipmentStatus, Record<LogisticsAction, StateShipmentStatus | null>> = {
  [STATE_SHIPMENT_STATUSES.REQUEST]: {
    [LOGISTICS_ACTIONS.RECEIVE_FULL]: STATE_SHIPMENT_STATUSES.NEW, // accept offer → создать отгрузку
    [LOGISTICS_ACTIONS.RECEIVE_PARTIAL]: null,
    [LOGISTICS_ACTIONS.RECONCILE_CREATE]: null,
    [LOGISTICS_ACTIONS.RECONCILE_CONFIRM]: null,
    [LOGISTICS_ACTIONS.PACK_CONFIGURE]: null,
    [LOGISTICS_ACTIONS.PACK_COMPLETE]: null,
    [LOGISTICS_ACTIONS.MERGE_ATTACH]: null,
    [LOGISTICS_ACTIONS.MERGE_DETACH]: null,
    [LOGISTICS_ACTIONS.MERGE_COMPLETE]: null,
    [LOGISTICS_ACTIONS.ARRIVAL_CITY]: null,
    [LOGISTICS_ACTIONS.HANDOVER_CONFIRM]: null,
    [LOGISTICS_ACTIONS.CANCEL]: STATE_SHIPMENT_STATUSES.ARCHIVED, // архив запроса
    [LOGISTICS_ACTIONS.ARCHIVE]: STATE_SHIPMENT_STATUSES.ARCHIVED,
  },
  
  [STATE_SHIPMENT_STATUSES.NEW]: {
    [LOGISTICS_ACTIONS.RECEIVE_FULL]: STATE_SHIPMENT_STATUSES.RECEIVE,
    [LOGISTICS_ACTIONS.RECEIVE_PARTIAL]: STATE_SHIPMENT_STATUSES.RECEIVE,
    [LOGISTICS_ACTIONS.RECONCILE_CREATE]: null,
    [LOGISTICS_ACTIONS.RECONCILE_CONFIRM]: null,
    [LOGISTICS_ACTIONS.PACK_CONFIGURE]: null,
    [LOGISTICS_ACTIONS.PACK_COMPLETE]: null,
    [LOGISTICS_ACTIONS.MERGE_ATTACH]: null,
    [LOGISTICS_ACTIONS.MERGE_DETACH]: null,
    [LOGISTICS_ACTIONS.MERGE_COMPLETE]: null,
    [LOGISTICS_ACTIONS.ARRIVAL_CITY]: null,
    [LOGISTICS_ACTIONS.HANDOVER_CONFIRM]: null,
    [LOGISTICS_ACTIONS.CANCEL]: STATE_SHIPMENT_STATUSES.CANCELLED,
    [LOGISTICS_ACTIONS.ARCHIVE]: null,
  },
  
  [STATE_SHIPMENT_STATUSES.RECEIVE]: {
    [LOGISTICS_ACTIONS.RECEIVE_FULL]: null,
    [LOGISTICS_ACTIONS.RECEIVE_PARTIAL]: null,
    [LOGISTICS_ACTIONS.RECONCILE_CREATE]: STATE_SHIPMENT_STATUSES.RECONCILE,
    [LOGISTICS_ACTIONS.RECONCILE_CONFIRM]: null,
    [LOGISTICS_ACTIONS.PACK_CONFIGURE]: null,
    [LOGISTICS_ACTIONS.PACK_COMPLETE]: null,
    [LOGISTICS_ACTIONS.MERGE_ATTACH]: null,
    [LOGISTICS_ACTIONS.MERGE_DETACH]: null,
    [LOGISTICS_ACTIONS.MERGE_COMPLETE]: null,
    [LOGISTICS_ACTIONS.ARRIVAL_CITY]: null,
    [LOGISTICS_ACTIONS.HANDOVER_CONFIRM]: null,
    [LOGISTICS_ACTIONS.CANCEL]: STATE_SHIPMENT_STATUSES.CANCELLED,
    [LOGISTICS_ACTIONS.ARCHIVE]: null,
  },
  
  [STATE_SHIPMENT_STATUSES.RECONCILE]: {
    [LOGISTICS_ACTIONS.RECEIVE_FULL]: null,
    [LOGISTICS_ACTIONS.RECEIVE_PARTIAL]: null,
    [LOGISTICS_ACTIONS.RECONCILE_CREATE]: null,
    [LOGISTICS_ACTIONS.RECONCILE_CONFIRM]: STATE_SHIPMENT_STATUSES.PACK, // после второго подтверждения
    [LOGISTICS_ACTIONS.PACK_CONFIGURE]: null,
    [LOGISTICS_ACTIONS.PACK_COMPLETE]: null,
    [LOGISTICS_ACTIONS.MERGE_ATTACH]: null,
    [LOGISTICS_ACTIONS.MERGE_DETACH]: null,
    [LOGISTICS_ACTIONS.MERGE_COMPLETE]: null,
    [LOGISTICS_ACTIONS.ARRIVAL_CITY]: null,
    [LOGISTICS_ACTIONS.HANDOVER_CONFIRM]: null,
    [LOGISTICS_ACTIONS.CANCEL]: STATE_SHIPMENT_STATUSES.CANCELLED,
    [LOGISTICS_ACTIONS.ARCHIVE]: null,
  },
  
  [STATE_SHIPMENT_STATUSES.PACK]: {
    [LOGISTICS_ACTIONS.RECEIVE_FULL]: null,
    [LOGISTICS_ACTIONS.RECEIVE_PARTIAL]: null,
    [LOGISTICS_ACTIONS.RECONCILE_CREATE]: null,
    [LOGISTICS_ACTIONS.RECONCILE_CONFIRM]: null,
    [LOGISTICS_ACTIONS.PACK_CONFIGURE]: null, // не меняет статус
    [LOGISTICS_ACTIONS.PACK_COMPLETE]: STATE_SHIPMENT_STATUSES.MERGE, // или IN_TRANSIT, зависит от наличия детей
    [LOGISTICS_ACTIONS.MERGE_ATTACH]: null,
    [LOGISTICS_ACTIONS.MERGE_DETACH]: null,
    [LOGISTICS_ACTIONS.MERGE_COMPLETE]: null,
    [LOGISTICS_ACTIONS.ARRIVAL_CITY]: null,
    [LOGISTICS_ACTIONS.HANDOVER_CONFIRM]: null,
    [LOGISTICS_ACTIONS.CANCEL]: STATE_SHIPMENT_STATUSES.CANCELLED,
    [LOGISTICS_ACTIONS.ARCHIVE]: null,
  },
  
  [STATE_SHIPMENT_STATUSES.MERGE]: {
    [LOGISTICS_ACTIONS.RECEIVE_FULL]: null,
    [LOGISTICS_ACTIONS.RECEIVE_PARTIAL]: null,
    [LOGISTICS_ACTIONS.RECONCILE_CREATE]: null,
    [LOGISTICS_ACTIONS.RECONCILE_CONFIRM]: null,
    [LOGISTICS_ACTIONS.PACK_CONFIGURE]: null,
    [LOGISTICS_ACTIONS.PACK_COMPLETE]: null,
    [LOGISTICS_ACTIONS.MERGE_ATTACH]: null, // не меняет статус
    [LOGISTICS_ACTIONS.MERGE_DETACH]: null, // не меняет статус
    [LOGISTICS_ACTIONS.MERGE_COMPLETE]: STATE_SHIPMENT_STATUSES.IN_TRANSIT,
    [LOGISTICS_ACTIONS.ARRIVAL_CITY]: null,
    [LOGISTICS_ACTIONS.HANDOVER_CONFIRM]: null,
    [LOGISTICS_ACTIONS.CANCEL]: STATE_SHIPMENT_STATUSES.CANCELLED,
    [LOGISTICS_ACTIONS.ARCHIVE]: null,
  },
  
  [STATE_SHIPMENT_STATUSES.IN_TRANSIT]: {
    [LOGISTICS_ACTIONS.RECEIVE_FULL]: null,
    [LOGISTICS_ACTIONS.RECEIVE_PARTIAL]: null,
    [LOGISTICS_ACTIONS.RECONCILE_CREATE]: null,
    [LOGISTICS_ACTIONS.RECONCILE_CONFIRM]: null,
    [LOGISTICS_ACTIONS.PACK_CONFIGURE]: null,
    [LOGISTICS_ACTIONS.PACK_COMPLETE]: null,
    [LOGISTICS_ACTIONS.MERGE_ATTACH]: null,
    [LOGISTICS_ACTIONS.MERGE_DETACH]: null,
    [LOGISTICS_ACTIONS.MERGE_COMPLETE]: null,
    [LOGISTICS_ACTIONS.ARRIVAL_CITY]: STATE_SHIPMENT_STATUSES.ON_DELIVERY,
    [LOGISTICS_ACTIONS.HANDOVER_CONFIRM]: null,
    [LOGISTICS_ACTIONS.CANCEL]: STATE_SHIPMENT_STATUSES.CANCELLED,
    [LOGISTICS_ACTIONS.ARCHIVE]: null,
  },
  
  [STATE_SHIPMENT_STATUSES.ON_DELIVERY]: {
    [LOGISTICS_ACTIONS.RECEIVE_FULL]: null,
    [LOGISTICS_ACTIONS.RECEIVE_PARTIAL]: null,
    [LOGISTICS_ACTIONS.RECONCILE_CREATE]: null,
    [LOGISTICS_ACTIONS.RECONCILE_CONFIRM]: null,
    [LOGISTICS_ACTIONS.PACK_CONFIGURE]: null,
    [LOGISTICS_ACTIONS.PACK_COMPLETE]: null,
    [LOGISTICS_ACTIONS.MERGE_ATTACH]: null,
    [LOGISTICS_ACTIONS.MERGE_DETACH]: null,
    [LOGISTICS_ACTIONS.MERGE_COMPLETE]: null,
    [LOGISTICS_ACTIONS.ARRIVAL_CITY]: null,
    [LOGISTICS_ACTIONS.HANDOVER_CONFIRM]: STATE_SHIPMENT_STATUSES.DELIVERED,
    [LOGISTICS_ACTIONS.CANCEL]: STATE_SHIPMENT_STATUSES.CANCELLED,
    [LOGISTICS_ACTIONS.ARCHIVE]: null,
  },
  
  [STATE_SHIPMENT_STATUSES.DELIVERED]: {
    [LOGISTICS_ACTIONS.RECEIVE_FULL]: null,
    [LOGISTICS_ACTIONS.RECEIVE_PARTIAL]: null,
    [LOGISTICS_ACTIONS.RECONCILE_CREATE]: null,
    [LOGISTICS_ACTIONS.RECONCILE_CONFIRM]: null,
    [LOGISTICS_ACTIONS.PACK_CONFIGURE]: null,
    [LOGISTICS_ACTIONS.PACK_COMPLETE]: null,
    [LOGISTICS_ACTIONS.MERGE_ATTACH]: null,
    [LOGISTICS_ACTIONS.MERGE_DETACH]: null,
    [LOGISTICS_ACTIONS.MERGE_COMPLETE]: null,
    [LOGISTICS_ACTIONS.ARRIVAL_CITY]: null,
    [LOGISTICS_ACTIONS.HANDOVER_CONFIRM]: null,
    [LOGISTICS_ACTIONS.CANCEL]: null,
    [LOGISTICS_ACTIONS.ARCHIVE]: STATE_SHIPMENT_STATUSES.ARCHIVED,
  },
  
  [STATE_SHIPMENT_STATUSES.ARCHIVED]: {
    [LOGISTICS_ACTIONS.RECEIVE_FULL]: null,
    [LOGISTICS_ACTIONS.RECEIVE_PARTIAL]: null,
    [LOGISTICS_ACTIONS.RECONCILE_CREATE]: null,
    [LOGISTICS_ACTIONS.RECONCILE_CONFIRM]: null,
    [LOGISTICS_ACTIONS.PACK_CONFIGURE]: null,
    [LOGISTICS_ACTIONS.PACK_COMPLETE]: null,
    [LOGISTICS_ACTIONS.MERGE_ATTACH]: null,
    [LOGISTICS_ACTIONS.MERGE_DETACH]: null,
    [LOGISTICS_ACTIONS.MERGE_COMPLETE]: null,
    [LOGISTICS_ACTIONS.ARRIVAL_CITY]: null,
    [LOGISTICS_ACTIONS.HANDOVER_CONFIRM]: null,
    [LOGISTICS_ACTIONS.CANCEL]: null,
    [LOGISTICS_ACTIONS.ARCHIVE]: null,
  },
  
  [STATE_SHIPMENT_STATUSES.CANCELLED]: {
    [LOGISTICS_ACTIONS.RECEIVE_FULL]: null,
    [LOGISTICS_ACTIONS.RECEIVE_PARTIAL]: null,
    [LOGISTICS_ACTIONS.RECONCILE_CREATE]: null,
    [LOGISTICS_ACTIONS.RECONCILE_CONFIRM]: null,
    [LOGISTICS_ACTIONS.PACK_CONFIGURE]: null,
    [LOGISTICS_ACTIONS.PACK_COMPLETE]: null,
    [LOGISTICS_ACTIONS.MERGE_ATTACH]: null,
    [LOGISTICS_ACTIONS.MERGE_DETACH]: null,
    [LOGISTICS_ACTIONS.MERGE_COMPLETE]: null,
    [LOGISTICS_ACTIONS.ARRIVAL_CITY]: null,
    [LOGISTICS_ACTIONS.HANDOVER_CONFIRM]: null,
    [LOGISTICS_ACTIONS.CANCEL]: null,
    [LOGISTICS_ACTIONS.ARCHIVE]: null,
  },
};

// Правила доступа: Map<action, allowedRoles>
export const ACTION_RBAC: Record<LogisticsAction, StateUserRole[]> = {
  [LOGISTICS_ACTIONS.RECEIVE_FULL]: [STATE_USER_ROLES.ADMIN, STATE_USER_ROLES.SUPER_ADMIN],
  [LOGISTICS_ACTIONS.RECEIVE_PARTIAL]: [STATE_USER_ROLES.ADMIN, STATE_USER_ROLES.SUPER_ADMIN],
  [LOGISTICS_ACTIONS.RECONCILE_CREATE]: [STATE_USER_ROLES.ADMIN, STATE_USER_ROLES.SUPER_ADMIN],
  [LOGISTICS_ACTIONS.RECONCILE_CONFIRM]: [STATE_USER_ROLES.USER, STATE_USER_ROLES.ADMIN, STATE_USER_ROLES.SUPER_ADMIN],
  [LOGISTICS_ACTIONS.PACK_CONFIGURE]: [STATE_USER_ROLES.ADMIN, STATE_USER_ROLES.SUPER_ADMIN],
  [LOGISTICS_ACTIONS.PACK_COMPLETE]: [STATE_USER_ROLES.ADMIN, STATE_USER_ROLES.SUPER_ADMIN],
  [LOGISTICS_ACTIONS.MERGE_ATTACH]: [STATE_USER_ROLES.ADMIN, STATE_USER_ROLES.SUPER_ADMIN],
  [LOGISTICS_ACTIONS.MERGE_DETACH]: [STATE_USER_ROLES.ADMIN, STATE_USER_ROLES.SUPER_ADMIN],
  [LOGISTICS_ACTIONS.MERGE_COMPLETE]: [STATE_USER_ROLES.ADMIN, STATE_USER_ROLES.SUPER_ADMIN],
  [LOGISTICS_ACTIONS.ARRIVAL_CITY]: [STATE_USER_ROLES.ADMIN, STATE_USER_ROLES.SUPER_ADMIN],
  [LOGISTICS_ACTIONS.HANDOVER_CONFIRM]: [STATE_USER_ROLES.USER, STATE_USER_ROLES.ADMIN, STATE_USER_ROLES.SUPER_ADMIN],
  [LOGISTICS_ACTIONS.CANCEL]: [STATE_USER_ROLES.ADMIN, STATE_USER_ROLES.SUPER_ADMIN],
  [LOGISTICS_ACTIONS.ARCHIVE]: [STATE_USER_ROLES.ADMIN, STATE_USER_ROLES.SUPER_ADMIN],
};

// Интерфейсы для валидации
export interface StateMachineContext {
  chatId: string;
  currentStatus: StateShipmentStatus;
  userId: string;
  userRole: StateUserRole;
  action: LogisticsAction;
  payload: unknown;
  clientId: string;
}

export interface TransitionResult {
  success: boolean;
  from: StateShipmentStatus;
  to: StateShipmentStatus | null;
  systemMessage?: {
    id: string;
    seq: number;
    payload: unknown;
  };
  auditId?: string;
  actionId?: string;
  error?: string;
}

// Основная функция стейт-машины
export function validateTransition(context: StateMachineContext): { valid: boolean; error?: string } {
  if (!FLAGS.STRICT_STATE_MACHINE) {
    return { valid: true };
  }

  const { currentStatus, action, userRole } = context;

  // Проверяем, разрешено ли действие для роли
  const allowedRoles = ACTION_RBAC[action];
  if (!allowedRoles.includes(userRole)) {
    return { valid: false, error: `Action ${action} not allowed for role ${userRole}` };
  }

  // Проверяем, разрешён ли переход из текущего статуса
  const allowedTransitions = STATE_TRANSITIONS[currentStatus];
  const targetStatus = allowedTransitions[action];
  
  if (targetStatus === null) {
    return { valid: false, error: `Action ${action} not allowed from status ${currentStatus}` };
  }

  return { valid: true };
}

// Получить следующий статус для действия
export function getNextStatus(currentStatus: StateShipmentStatus, action: LogisticsAction): StateShipmentStatus | null {
  return STATE_TRANSITIONS[currentStatus]?.[action] || null;
}

// Получить доступные действия для статуса и роли
export function getAvailableActions(status: StateShipmentStatus, role: StateUserRole): LogisticsAction[] {
  const actions: LogisticsAction[] = [];
  
  for (const [action, targetStatus] of Object.entries(STATE_TRANSITIONS[status])) {
    const logisticsAction = action as LogisticsAction;
    const allowedRoles = ACTION_RBAC[logisticsAction];
    
    if (allowedRoles.includes(role) && targetStatus !== null) {
      actions.push(logisticsAction);
    }
  }
  
  return actions;
}

// Получить статусы, которые могут перейти в указанный
export function getPreviousStatuses(targetStatus: StateShipmentStatus): StateShipmentStatus[] {
  const previous: StateShipmentStatus[] = [];
  
  for (const [fromStatus, transitions] of Object.entries(STATE_TRANSITIONS)) {
    for (const [action, toStatus] of Object.entries(transitions)) {
      if (toStatus === targetStatus) {
        previous.push(fromStatus as StateShipmentStatus);
        break;
      }
    }
  }
  
  return previous;
}

// Проверить, является ли статус финальным
export function isFinalStatus(status: StateShipmentStatus): boolean {
  return status === STATE_SHIPMENT_STATUSES.ARCHIVED || status === STATE_SHIPMENT_STATUSES.CANCELLED;
}

// Получить прогресс отгрузки (0-100%)
export function getProgressPercentage(status: StateShipmentStatus): number {
  const progressMap: Record<StateShipmentStatus, number> = {
    [STATE_SHIPMENT_STATUSES.REQUEST]: 0,
    [STATE_SHIPMENT_STATUSES.NEW]: 10,
    [STATE_SHIPMENT_STATUSES.RECEIVE]: 20,
    [STATE_SHIPMENT_STATUSES.RECONCILE]: 30,
    [STATE_SHIPMENT_STATUSES.PACK]: 40,
    [STATE_SHIPMENT_STATUSES.MERGE]: 50,
    [STATE_SHIPMENT_STATUSES.IN_TRANSIT]: 70,
    [STATE_SHIPMENT_STATUSES.ON_DELIVERY]: 90,
    [STATE_SHIPMENT_STATUSES.DELIVERED]: 100,
    [STATE_SHIPMENT_STATUSES.ARCHIVED]: 100,
    [STATE_SHIPMENT_STATUSES.CANCELLED]: 0,
  };
  
  return progressMap[status] || 0;
}

// Получить цвет статуса для UI
export function getStatusColor(status: StateShipmentStatus): string {
  const colorMap: Record<StateShipmentStatus, string> = {
    [STATE_SHIPMENT_STATUSES.REQUEST]: 'green',
    [STATE_SHIPMENT_STATUSES.NEW]: 'blue',
    [STATE_SHIPMENT_STATUSES.RECEIVE]: 'yellow',
    [STATE_SHIPMENT_STATUSES.RECONCILE]: 'orange',
    [STATE_SHIPMENT_STATUSES.PACK]: 'purple',
    [STATE_SHIPMENT_STATUSES.MERGE]: 'indigo',
    [STATE_SHIPMENT_STATUSES.IN_TRANSIT]: 'cyan',
    [STATE_SHIPMENT_STATUSES.ON_DELIVERY]: 'pink',
    [STATE_SHIPMENT_STATUSES.DELIVERED]: 'green',
    [STATE_SHIPMENT_STATUSES.ARCHIVED]: 'gray',
    [STATE_SHIPMENT_STATUSES.CANCELLED]: 'red',
  };
  
  return colorMap[status] || 'gray';
}

// Получить человекочитаемое название статуса
export function getStatusLabel(status: StateShipmentStatus): string {
  const labelMap: Record<StateShipmentStatus, string> = {
    [STATE_SHIPMENT_STATUSES.REQUEST]: 'Запрос',
    [STATE_SHIPMENT_STATUSES.NEW]: 'Новая отгрузка',
    [STATE_SHIPMENT_STATUSES.RECEIVE]: 'Приёмка',
    [STATE_SHIPMENT_STATUSES.RECONCILE]: 'Сверка',
    [STATE_SHIPMENT_STATUSES.PACK]: 'Упаковка',
    [STATE_SHIPMENT_STATUSES.MERGE]: 'Совмещение',
    [STATE_SHIPMENT_STATUSES.IN_TRANSIT]: 'В пути',
    [STATE_SHIPMENT_STATUSES.ON_DELIVERY]: 'К выдаче',
    [STATE_SHIPMENT_STATUSES.DELIVERED]: 'Выдано',
    [STATE_SHIPMENT_STATUSES.ARCHIVED]: 'Архив',
    [STATE_SHIPMENT_STATUSES.CANCELLED]: 'Отменено',
  };
  
  return labelMap[status] || status;
}

// Получить человекочитаемое название действия
export function getActionLabel(action: LogisticsAction): string {
  const labelMap: Record<LogisticsAction, string> = {
    [LOGISTICS_ACTIONS.RECEIVE_FULL]: 'Груз принят полностью',
    [LOGISTICS_ACTIONS.RECEIVE_PARTIAL]: 'Груз принят частично',
    [LOGISTICS_ACTIONS.RECONCILE_CREATE]: 'Создать сверку',
    [LOGISTICS_ACTIONS.RECONCILE_CONFIRM]: 'Подтвердить сверку',
    [LOGISTICS_ACTIONS.PACK_CONFIGURE]: 'Настроить упаковку',
    [LOGISTICS_ACTIONS.PACK_COMPLETE]: 'Завершить упаковку',
    [LOGISTICS_ACTIONS.MERGE_ATTACH]: 'Присоединить отгрузку',
    [LOGISTICS_ACTIONS.MERGE_DETACH]: 'Отсоединить отгрузку',
    [LOGISTICS_ACTIONS.MERGE_COMPLETE]: 'Завершить совмещение',
    [LOGISTICS_ACTIONS.ARRIVAL_CITY]: 'Прибыло в город',
    [LOGISTICS_ACTIONS.HANDOVER_CONFIRM]: 'Подтвердить выдачу',
    [LOGISTICS_ACTIONS.CANCEL]: 'Отменить',
    [LOGISTICS_ACTIONS.ARCHIVE]: 'Архивировать',
  };
  
  return labelMap[action] || action;
}
