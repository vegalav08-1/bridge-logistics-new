export type SearchEntity =
  | 'shipment' | 'request' | 'chat'
  | 'document' | 'attachment'
  | 'partner'  | 'address' | 'person';

export type SearchResult = {
  id: string;               // canonical id
  entity: SearchEntity;
  title: string;
  subtitle?: string;
  badge?: 'status'|'debt'|'unread'|'kyc'|'doc';
  link: string;             // deep-link (router href)
  meta?: Record<string, any>;
};

export type SearchQuery = {
  q: string;
  limit?: number;
  cursor?: string;
};

export type ScanPayload = {
  raw: string;              // сырая строка из QR/штрих-кода
  kind: 'qr'|'code128'|'ean13'|'unknown';
};

export type OcrField =
  | 'trackOld' | 'docNumber' | 'recipientName' | 'phone' | 'address' | 'weight' | 'volume';

export type OcrResult = {
  text: string;                               // полный текст
  fields: Partial<Record<OcrField,string>>;   // извлечённые поля
  confidence?: number;                        // 0..1
};


