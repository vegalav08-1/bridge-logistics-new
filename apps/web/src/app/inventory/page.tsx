'use client';
import { BackButton } from '@/components/layout/BackButton';
import InventoryList from './components/InventoryList';

export default function InventoryPage() {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <h1 className="text-lg font-semibold">Склад</h1>
      </div>
      <InventoryList />
    </div>
  );
}
