'use client';
import type { Action, Resource } from './types';
import { useAbility } from './useAbility';

type Props = {
  resource: Resource;
  action: Action;
  mode?: 'hide' | 'disable';   // hide: не рендерим; disable: рендерим disabled + title
  children: React.ReactNode | ((can: boolean) => React.ReactNode);
};

export default function IfCan({ resource, action, mode='hide', children }: Props) {
  const { ability } = useAbility();
  const ok = ability.can(resource, action);

  if (typeof children === 'function') return <>{children(ok)}</>;

  if (ok) return <>{children}</>;

  if (mode === 'hide') return null;

  return (
    <span aria-disabled="true" title={ability.reason(resource, action) ?? 'Нет доступа'} className="opacity-60 cursor-not-allowed">
      {children}
    </span>
  );
}


