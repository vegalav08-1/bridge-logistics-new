const KEY = 'forms_v2_drafts';

type DraftsStore = Record<string, any>;

export function loadDraft<T = any>(formKey: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const all = JSON.parse(raw) as DraftsStore;
    return (all[formKey] ?? null) as T | null;
  } catch { return null; }
}

export function saveDraft(formKey: string, value: any) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KEY);
    const all: DraftsStore = raw ? JSON.parse(raw) : {};
    all[formKey] = value;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
}

export function clearDraft(formKey: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const all: DraftsStore = JSON.parse(raw);
    delete all[formKey];
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
}


