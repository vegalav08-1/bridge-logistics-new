import type { TimelineEvent } from './types';
export function asRow(e: TimelineEvent) {
  return {
    icon: e.type,
    title: e.title,
    sub: e.subtitle ?? '',
    at: new Date(e.atISO).toLocaleString(),
    ref: e.ref,
  };
}

