'use client';
import { useInventory } from '@/lib/inventory/useInventory';
import ItemCard from './ItemCard';

export default function InventoryList() {
  const { items, busy } = useInventory();

  if (busy) {
    return <div className="text-sm text-gray-500">Загрузка...</div>;
  }

  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <div className="text-sm text-gray-500">Нет позиций на складе</div>
      ) : (
        items.map(item => (
          <ItemCard key={item.id} i={item} />
        ))
      )}
    </div>
  );
}


