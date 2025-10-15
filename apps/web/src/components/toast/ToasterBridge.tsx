'use client';
import { useEffect } from 'react';

// Предположим, что есть глобальный hook useToast() или window.alert как заглушка
declare global {
  interface Window { showToast?: (o:{title:string;description?:string;actionHref?:string})=>void; }
}

export default function ToasterBridge(){
  useEffect(()=>{
    const on = (e: Event) => {
      const { title, description, actionHref } = (e as CustomEvent).detail as {title:string;description?:string;actionHref?:string};
      if (window.showToast) window.showToast({ title, description, actionHref });
      else {
        // мягкая заглушка
        // eslint-disable-next-line no-alert
        console.log('[toast]', title, description ?? '', actionHref ?? '');
      }
    };
    window.addEventListener('toast:show', on);
    return () => window.removeEventListener('toast:show', on);
  },[]);
  return null;
}


