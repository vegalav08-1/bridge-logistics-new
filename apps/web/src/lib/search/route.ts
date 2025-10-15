import { resolveApi } from './api';
import { normalize } from './tokenize';

export async function resolveDeepLink(input: string) {
  const raw = normalize(input);
  const res = await resolveApi(raw);
  return res; // {entity,id,link} | null
}


