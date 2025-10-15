import { Offer } from './types';

export function calcOfferTotal(o: Offer | Parameters<typeof calcDraft>[0]) {
  const lines = ('lines' in o) ? o.lines : o.lines;
  const sumLines = lines.reduce((acc, l) => {
    const discount = (l.discountPct ?? 0) / 100;
    const tax = (l.taxPct ?? 0) / 100;
    const line = l.qty * l.price * (1 - discount);
    const taxed = line * (1 + tax);
    return acc + taxed;
  }, 0);
  const docDisc = ('discountPct' in o && o.discountPct) ? (o.discountPct as number)/100 : 0;
  const docTax = ('taxPct' in o && o.taxPct) ? (o.taxPct as number)/100 : 0;
  const afterDisc = sumLines * (1 - docDisc);
  const total = afterDisc * (1 + docTax);
  return Math.round(total * 100) / 100;
}

export function calcBalance({ invoices, payments }: { invoices: { total: number }[], payments: { amount: number }[] }) {
  const inv = invoices.reduce((a, i) => a + i.total, 0);
  const pay = payments.reduce((a, p) => a + p.amount, 0);
  const debt = Math.max(0, inv - pay);
  return { inv, pay, debt };
}

// Helper function for draft calculation
export function calcDraft(lines: any[]) {
  return { lines };
}


