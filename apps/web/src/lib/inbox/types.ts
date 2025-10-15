export type NotificationKind =
  | 'chat_message'
  | 'system_event'
  | 'shipment_status'
  | 'request_status'
  | 'promo';

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  link?: string;             // куда перейти
  createdAtISO: string;
  read: boolean;
  meta?: Record<string, any>;
}


