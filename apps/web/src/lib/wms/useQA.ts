'use client';
import { useEffect, useState } from 'react';
import * as api from './api';
import type { QAIssue } from './types';

export function useQA(orderId: string) {
  const [issues, setIssues] = useState<QAIssue[]>([]);
  useEffect(() => { (async () => { setIssues(await api.listQA(orderId)); })(); }, [orderId]);
  async function upsert(i: QAIssue) { const res = await api.upsertQA(orderId, i); setIssues(prev => [res, ...prev.filter(x => x.id !== res.id)]); }
  return { issues, upsert };
}

