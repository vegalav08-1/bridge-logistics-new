'use client';
import type { Action, Resource } from './types';
import { useAbility } from './useAbility';
import Link from 'next/link';

export default function Guard({ resource, action, children }: { resource: Resource; action: Action; children: React.ReactNode }) {
  const { ability, guard } = useAbility();
  if (!ability.can(resource, action)) {
    guard(resource, action);
    return (
      <div className="p-6">
        <h1 className="text-lg font-semibold">403 — Недостаточно прав</h1>
        <p className="text-sm text-gray-600 mt-2">{ability.reason(resource, action)}</p>
        <div className="mt-4"><Link href="/shipments" className="text-[var(--brand)] underline">На главную</Link></div>
      </div>
    );
  }
  return <>{children}</>;
}


