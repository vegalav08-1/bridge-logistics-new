export type NotifType = 'status' | 'finance' | 'system' | 'message';
export type Notif = {
  id: string;
  type: NotifType;
  title: string;
  body?: string;
  createdAtISO: string;
  read: boolean;
  link?: string;        // deep-link по клику
};

