export type OutboxKind = 'text' | 'file';

export interface OutboxItemBase {
  id: string;             // tempId (uuid)
  chatId: string;
  createdAt: number;      // Date.now()
  tries: number;          // попытки отправки
  lastError?: string;
  status: 'queued' | 'sending' | 'failed';
  kind: OutboxKind;
}

export interface OutboxText extends OutboxItemBase {
  kind: 'text';
  text: string;
}

export interface OutboxFile extends OutboxItemBase {
  kind: 'file';
  fileName: string;
  fileType: string;
  fileSize: number;
  // blob хранится в IDB (fileBlob)
}

export type OutboxItem = OutboxText | OutboxFile;


