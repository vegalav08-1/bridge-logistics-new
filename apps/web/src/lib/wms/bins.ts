import type { Bin } from './types';
export function formatBin(b: Bin) { return `${b.area}-${b.rack}-${b.shelf}-${b.cell}`; }
export function validateBinCode(code: string) { return /^[A-Z]-\d{2}-\d{2}-\d{2}$/.test(code); }

