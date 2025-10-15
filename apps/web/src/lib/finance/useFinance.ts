'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createOffer, listOffers, createInvoice, listInvoices, postPayment, getBalance } from './api';
import type { Offer, Invoice, Payment, Balance, Currency } from './types';

export function useFinance(chatId: string, baseCurrency: Currency = 'RUB') {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const [of, inv, bal] = await Promise.all([
      listOffers(chatId), listInvoices(chatId), getBalance(chatId, baseCurrency)
    ]);
    setOffers(of); setInvoices(inv); setBalance(bal);
  }, [chatId, baseCurrency]);

  useEffect(() => { load(); }, [load]);

  const createOfferAction = useCallback(async (payload: any) => {
    setBusy(true); setErr(null);
    try { 
      const off = await createOffer(payload); 
      setOffers(o => [off, ...o]); 
      return off; 
    }
    catch (e: any) { setErr(e?.message ?? 'Ошибка оффера'); }
    finally { setBusy(false); }
  }, []);

  const createInvoiceAction = useCallback(async (payload: any) => {
    setBusy(true); setErr(null);
    try { 
      const inv = await createInvoice(payload); 
      setInvoices(i => [inv, ...i]); 
      return inv; 
    }
    catch (e: any) { setErr(e?.message ?? 'Ошибка инвойса'); }
    finally { setBusy(false); }
  }, []);

  const postPaymentAction = useCallback(async (payload: any) => {
    setBusy(true); setErr(null);
    try { 
      const p: Payment = await postPayment(payload); 
      await load(); 
      return p; 
    }
    catch (e: any) { setErr(e?.message ?? 'Ошибка оплаты'); }
    finally { setBusy(false); }
  }, [load]);

  return useMemo(() => ({
    offers, invoices, balance, busy, err, load,
    createOffer: createOfferAction, 
    createInvoice: createInvoiceAction, 
    postPayment: postPaymentAction
  }), [offers, invoices, balance, busy, err, load, createOfferAction, createInvoiceAction, postPaymentAction]);
}


