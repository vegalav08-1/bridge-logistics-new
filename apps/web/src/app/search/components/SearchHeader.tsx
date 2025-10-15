'use client';
import { useState } from 'react';
import { useACL } from '@/lib/acl/context';
import ScannerSheet from '@/lib/scanner/sheet';

export default function SearchHeader() {
  const [open, setOpen] = useState(false);
  const { ctx } = useACL();
  
  // Показываем кнопку только для администраторов
  if (ctx.role !== 'ADMIN') {
    return (
      <header className="flex h-14 items-center justify-between px-4 bg-surface border-b border-border safe-area-top">
        <div className="flex items-center space-x-2"></div>
        <h1 className="flex-1 text-center text-lg font-semibold text-text truncate">Поиск</h1>
        <div className="flex items-center space-x-2"></div>
      </header>
    );
  }
  
  return (
    <>
      <header className="flex h-14 items-center justify-between px-4 bg-surface border-b border-border safe-area-top">
        <div className="flex items-center space-x-2"></div>
        <h1 className="flex-1 text-center text-lg font-semibold text-text truncate">Поиск</h1>
        <div className="flex items-center space-x-2">
          <button 
            className="h-10 px-4 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center space-x-2" 
            onClick={() => setOpen(true)}
          >
            <span>📱</span>
            <span>Отсканировать груз</span>
          </button>
        </div>
      </header>
      <ScannerSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}

