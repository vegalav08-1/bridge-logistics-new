'use client';
import { useState, useCallback } from 'react';
import { generateLabel } from './api';

export function useLabels() {
  const [busy, setBusy] = useState(false);

  const generate = useCallback(async (id: string, format: 'QR' | 'BARCODE') => {
    setBusy(true);
    try {
      const result = await generateLabel({ id, format });
      return result;
    } finally {
      setBusy(false);
    }
  }, []);

  return { generate, busy };
}


