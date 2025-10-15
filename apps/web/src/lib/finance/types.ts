export type Currency = 'RUB'|'USD'|'EUR'|'KZT'|'CNY';

export type OfferLine = {
  id: string;
  name: string;
  qty: number;
  unit: 'pcs'|'kg'|'m3';
  price: number;           // цена за единицу в валюте оффера
  discountPct?: number;    // % скидки на строку
  taxPct?: number;         // % налога на строку (если применимо)
  meta?: Record<string, any>; // связь со складами/упаковкой (S14)
};

export type Offer = {
  id: string;
  chatId: string;
  currency: Currency;
  rateToBase: number;      // фиксируется при создании (если FX_V2_ENABLED)
  lines: OfferLine[];
  discountPct?: number;    // скидка на документ
  taxPct?: number;         // налог на документ
  note?: string;
  status: 'DRAFT'|'SENT'|'ACCEPTED'|'REJECTED'|'ARCHIVED';
  createdAtISO: string;
  createdBy: string;
};

export type Invoice = {
  id: string;
  chatId: string;
  offerId: string;
  currency: Currency;
  total: number;           // сумма к оплате в валюте инвойса
  status: 'PENDING'|'PARTIAL'|'PAID'|'CANCELLED';
  dueAtISO?: string;       // срок оплаты
  issuedAtISO: string;
  pdfUrl?: string;         // ссылка на PDF (S16)
};

export type Payment = {
  id: string;
  invoiceId: string;
  method: 'CASH'|'BANK'|'CARD';
  amount: number;
  currency: Currency;
  rateToBase: number;
  createdAtISO: string;
  ref?: string;            // референс транзакции
  meta?: Record<string, any>;
};

export type Balance = {
  chatId: string;
  currency: Currency;  // базовая валюта тенанта
  totalOffered: number;
  totalInvoiced: number;
  totalPaid: number;
  debt: number;        // >= 0
};


