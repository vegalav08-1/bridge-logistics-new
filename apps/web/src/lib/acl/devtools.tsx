'use client';
import { useACL } from './context';
export default function ACLDevtools(){
  if (process.env.NODE_ENV === 'production') return null;
  // Отображение статуса отключено
  return null;
}

