'use client';
import { moneyFmt } from '@/lib/finance/fx';

export default function Money({ value, ccy }: { value: number; ccy: string }) {
  return <span>{moneyFmt(value, ccy)}</span>;
}


