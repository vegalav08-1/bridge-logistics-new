/**
 * UI-level types for Chat UI3
 */

export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export type ShipmentStatus = 
  | 'REQUEST'
  | 'NEW'
  | 'RECEIVE'
  | 'PACK'
  | 'MERGE'
  | 'IN_TRANSIT'
  | 'ON_DELIVERY'
  | 'DELIVERED'
  | 'ARCHIVED'
  | 'CANCELLED'
  | 'DELETED';

export interface ChatHeaderVM {
  chatId: string;
  number: string;        // BR...
  title: string;         // например: User_XXXX · AdminName
  subtitle?: string;     // краткое пояснение (адрес, краткое описание)
  status: ShipmentStatus;
  updatedAtISO: string;
  unreadCount?: number;
  adminName?: string;
  userName?: string;
  qrAvailable?: boolean; // есть QR (для NEW/RECEIVE)
}

export interface StatusAction {
  key: string;           // 'receive_full'|'receive_partial'|'start_reconcile'...
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  opens?: 'modal' | 'drawer' | 'none';
  disabled?: boolean;
  tooltip?: string;
}

export interface ActionsVM {
  primary: StatusAction[];   // крупные кнопки
  secondary?: StatusAction[]; // иконки/вспомогательные
}

export interface StatusTransitionPayload {
  action: string;
  payload?: any;
  confirmed: boolean;
}

