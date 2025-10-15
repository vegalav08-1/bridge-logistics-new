import Money from '@/components/finance/Money';

export default function InvoiceCard({ invoice }: { invoice: any }) {
  return (
    <div className="mx-6 my-2 rounded-xl bg-[var(--muted)] px-3 py-2 text-xs">
      Инвойс {invoice.id.slice(-6)} · {invoice.status} · Сумма: <Money value={invoice.total} ccy={invoice.currency} />
      {invoice.pdfUrl && (
        <div className="mt-1">
          <a href={invoice.pdfUrl} className="text-[var(--brand)] underline" target="_blank" rel="noopener noreferrer">
            Скачать PDF
          </a>
        </div>
      )}
    </div>
  );
}


