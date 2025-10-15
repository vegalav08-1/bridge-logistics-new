export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export type OrderStatus =
  | 'REQUEST'
  | 'NEW'
  | 'RECEIVE'
  | 'PACK'
  | 'MERGE'
  | 'IN_TRANSIT'
  | 'ON_DELIVERY'
  | 'DELIVERED'
  | 'ARCHIVED'
  | 'CANCELLED';

export type TransitionKey =
  | 'REQUEST_SUBMIT'      // user => NEW
  | 'RECEIVE_ACCEPT'      // admin/employee => RECEIVE
  | 'RECEIVE_FINISH'      // admin/employee => PACK (объединенная приемка и сверка)
  | 'PACK_START' | 'PACK_FINISH'
  | 'MERGE_ATTACH' | 'MERGE_FINISH'
  | 'SHIP' | 'ARRIVE_CITY' | 'OUT_FOR_DELIVERY' | 'DELIVER'
  | 'ARCHIVE' | 'CANCEL';

export type RACI = { R: Role[]; A: Role[]; C: Role[]; I: Role[] };  // Responsible/Accountable/Consulted/Informed

export type SLAStage = {
  key: string;                    // e.g., 'RECEIVE:complete'
  status: OrderStatus;            // к какому статусу относится
  targetHours: number;            // целевое время выполнения
  hardLimitHours?: number;        // жёсткий предел (эскалация сразу)
  escalateTo: Role[];             // кому слать эскалацию
};

export type Order = {
  id: string;
  number: string;
  status: OrderStatus;
  assignedTo?: string;            // id ответственного (userId/employeeId)
  ownerRole: Role;                // роль владельца процесса (обычно ADMIN)
  createdAtISO: string;
  updatedAtISO: string;
  // вспомогательные поля, которые уже есть в проекте, не перечисляем
};

export type JournalEvent = {
  id: string;
  atISO: string;
  type: 'transition' | 'sla' | 'raci' | 'note';
  actorId?: string;
  payload: any;
};
