import type { Offer, Invoice, Payment, Balance, Currency } from './types';
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function createOffer(input: any): Promise<Offer> {
  await wait(200);
  return { 
    id: 'off_' + Math.random().toString(36).slice(2), 
    status: 'SENT', 
    rateToBase: 1,
    createdAtISO: new Date().toISOString(), 
    createdBy: 'admin', 
    ...input 
  };
}

export async function listOffers(chatId: string): Promise<Offer[]> {
  await wait(150);
  return [];
}

export async function createInvoice(input: any): Promise<Invoice> {
  await wait(200);
  return { 
    id: 'inv_' + Math.random().toString(36).slice(2), 
    status: 'PENDING', 
    issuedAtISO: new Date().toISOString(), 
    ...input 
  };
}

export async function listInvoices(chatId: string): Promise<Invoice[]> {
  await wait(150);
  return [];
}

export async function postPayment(input: any): Promise<Payment> {
  await wait(200);
  return { 
    id: 'pay_' + Math.random().toString(36).slice(2), 
    rateToBase: 1, 
    createdAtISO: new Date().toISOString(), 
    ...input 
  };
}

export async function getBalance(chatId: string, base: 'RUB' | Currency = 'RUB'): Promise<Balance> {
  await wait(120);
  return { 
    chatId, 
    currency: base, 
    totalOffered: 0, 
    totalInvoiced: 0, 
    totalPaid: 0, 
    debt: 0 
  };
}


