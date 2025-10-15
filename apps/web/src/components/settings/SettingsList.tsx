import Link from 'next/link';

const rows = [
  { href: '/settings/profile', title: 'Профиль', subtitle: 'Компания, контакт, email, телефон' },
  { href: '/settings/addresses', title: 'Адреса складов', subtitle: 'Ваши склады' },
  { href: '/settings/city', title: 'Город', subtitle: 'Город по умолчанию' },
  { href: '/settings/shipping', title: 'Тип отгрузки', subtitle: 'Воздух, Море, Грузовик…' },
  { href: '/settings/receipt', title: 'Адрес получения', subtitle: 'Адрес выдачи клиенту' },
];

export default function SettingsList() {
  return (
    <div className="divide-y rounded-2xl border">
      {rows.map(r => (
        <Link key={r.href} href={r.href} className="block px-4 py-3 hover:bg-[var(--muted)]">
          <div className="text-sm font-medium">{r.title}</div>
          <div className="text-xs text-gray-500">{r.subtitle}</div>
        </Link>
      ))}
    </div>
  );
}
