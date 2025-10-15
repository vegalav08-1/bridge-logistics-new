export type FxTable = Record<string, number>; // 'USD'-> курс к базовой

export function fxConvert(amount: number, from: string, to: string, fx: FxTable): number {
  if (from === to) return amount;
  const base = amount / (fx[from] || 1);
  return Math.round(base * (fx[to] || 1) * 100) / 100;
}

export function moneyFmt(v: number, ccy: string) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: ccy }).format(v);
}


