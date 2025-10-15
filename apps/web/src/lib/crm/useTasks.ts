'use client';
import { useEffect, useState } from 'react';
import * as api from './api';
import type { Task } from './types';

export function useTasks(entityId: string) {
  const [list, setList] = useState<Task[]>([]);
  useEffect(() => { (async () => setList(await api.listTasks(entityId)))(); }, [entityId]);
  async function upsert(t: Task) { const res = await api.upsertTask(entityId, t); setList(prev => [res, ...prev.filter(x => x.id !== res.id)]); }
  async function toggle(taskId: string, done: boolean) { const res = await api.toggleTask(entityId, taskId, done); setList(prev => [res, ...prev.filter(x => x.id !== res.id)]); }
  return { list, upsert, toggle };
}

