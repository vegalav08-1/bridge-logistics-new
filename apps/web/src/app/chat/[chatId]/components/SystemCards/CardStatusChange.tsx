export default function CardStatusChange({ from, to, atISO }:{ from:string; to:string; atISO:string }) {
  return (
    <div className="mx-6 my-2 rounded-xl bg-[var(--muted)] px-3 py-2 text-xs text-gray-600">
      Статус: {from} → <b>{to}</b> · {new Date(atISO).toLocaleString()}
    </div>
  );
}


