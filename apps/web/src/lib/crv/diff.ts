// минимальный объектный дифф для поддерживаемых ключей
import type { CRField } from './types';

export function applyFields(snapshot: Record<string, any>, fields: CRField[]) {
  const next = structuredClone(snapshot);
  for (const f of fields) {
    switch (f.key) {
      case 'delivery.address': next.delivery ??= {}; next.delivery.address = f.next; break;
      case 'delivery.city': next.delivery ??= {}; next.delivery.city = f.next; break;
      case 'delivery.date': next.delivery ??= {}; next.delivery.date = f.next; break;
      case 'pricing.total': next.pricing ??= {}; next.pricing.total = f.next; next.pricing.currency = f.currency; break;
      case 'items.add':
        next.items ??= [];
        next.items = [...next.items, ...f.next];
        break;
      case 'items.remove':
        next.items ??= [];
        next.items = next.items.filter((it: any) => !f.next.some(r => r.sku === it.sku));
        break;
      case 'meta.note':
        next.meta ??= {}; next.meta.note = f.next;
        break;
      default: break;
    }
  }
  return next;
}

