'use client';
import { useState } from 'react';
import { useACL } from '@/lib/acl/context';
import ScannerSheet from '@/lib/scanner/sheet';

export default function ScannerButton(){
  const [open,setOpen]=useState(false);
  const { ctx } = useACL();
  
  // Показываем кнопку только для администраторов
  if (ctx.role !== 'ADMIN') {
    return null;
  }
  
  return (
    <>
      <button className="h-10 w-10 rounded-xl border grid place-items-center" aria-label="Сканер" onClick={()=>setOpen(true)}>
        <svg width="18" height="18" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" fill="none"/></svg>
      </button>
      <ScannerSheet open={open} onClose={()=>setOpen(false)} />
    </>
  );
}

