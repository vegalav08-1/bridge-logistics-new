export type ChatId = string;
export type MessageId = string;
export type Role = 'USER'|'ADMIN'|'SUPER_ADMIN';

export type ChatVisibility = 'PRIVATE'|'LINK'|'QR_SCANNABLE';

export type Participant = {
  userId: string;
  role: Role;
  joinedAtISO: string;
  muted?: boolean;              // персональный mute
  displayName?: string;
  avatarUrl?: string;
};

export type Mention = { userId:string; from:number; to:number };

export type MsgKind = 'text'|'file'|'system'|'finance'|'event';

export type Message = {
  id: MessageId;
  chatId: ChatId;
  kind: MsgKind;
  text?: string;                 // безопасный текст (после sanitize)
  mentions?: Mention[];
  files?: Array<{ id:string; name:string; size:number; mime:string; }>;
  authorId: string;
  createdAtISO: string;
  editedAtISO?: string;
  pinned?: boolean;
  systemType?: 'status'|'cr'|'wms'|'carrier'|'merge'|'split'|'qr'|'audit';
  finance?: { sign:'+'|'-'; amount:number; currency:string; note?:string; ref?:string };
};

export type ChatSettings = {
  muteAll?: boolean;               // бесшумный режим на чат
  allowMentionsOverride?: boolean; // @ пробивает mute
  allowExternalInvite?: boolean;   // приглашения по ссылке/QR
};

export type Chat = {
  id: ChatId;
  orderId: string;
  title: string;
  visibility: ChatVisibility;
  participants: Participant[];
  settings: ChatSettings;
  createdAtISO: string;
  parentId?: ChatId;
  mergedChildren?: ChatId[];
};

