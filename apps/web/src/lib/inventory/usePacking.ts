'use client';
import { useState, useCallback } from 'react';
import { createPackage, generateLabel } from './api';
import type { Package } from './types';

export function usePacking(shipmentId: string) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [busy, setBusy] = useState(false);

  const pack = useCallback(async (items: any[]) => {
    setBusy(true);
    const p = await createPackage({ shipmentId, items });
    setPackages(prev => [p, ...prev]);
    setBusy(false);
    return p;
  }, [shipmentId]);

  const label = useCallback(async (id: string, fmt: 'QR' | 'BARCODE') => {
    return await generateLabel({ id, format: fmt });
  }, []);

  return { packages, pack, label, busy };
}


