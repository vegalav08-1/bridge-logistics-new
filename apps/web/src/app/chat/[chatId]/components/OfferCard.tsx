import Money from '@/components/finance/Money';

export default function OfferCard({ offer }: { offer: any }) {
  return (
    <div className="mx-6 my-2 rounded-xl bg-[var(--muted)] px-3 py-2 text-xs">
      Оффер отправлен · {offer.currency} · позиций: {offer.lines.length} · Итого: <Money value={offer.total} ccy={offer.currency} />
    </div>
  );
}


