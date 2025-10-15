'use client';
import { useMemo, useState } from 'react';
import { BackButton } from '@/components/layout/BackButton';
import ShipmentsHeader from '@/components/shipments/ShipmentsHeader';
import ShipmentsList from '@/components/shipments/ShipmentsList';
import type { ShipmentKind, ShipmentStatus, ShipmentsQuery } from '@/lib/shipments/types';
import { useRouter } from 'next/navigation';

export default function ShipmentsV2Page() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [kinds, setKinds] = useState<ShipmentKind[]>([]);
  const [statuses, setStatuses] = useState<ShipmentStatus[]>([]);

  const query: ShipmentsQuery = useMemo(() => ({
    search: search || undefined,
    kind: kinds.length ? kinds : undefined,
    status: statuses.length ? statuses : undefined,
  }), [search, kinds, statuses]);

  const onCreate = () => {
    // Пример: у админа — создание отгрузки, у пользователя — запрос
    // Тут можно проверить роль из контекста/стора
    router.push('/shipments/new'); // замените на нужный роут
  };

  return (
    <div className="pb-[72px]"> {/* отступ под нижнюю навигацию на мобайле */}
      <div className="flex items-center gap-3 px-4 py-3">
        <BackButton />
        <div className="text-lg font-semibold">Отгрузки</div>
      </div>
      <ShipmentsHeader
        valueSearch={search}
        onSearchChange={setSearch}
        selectedKinds={kinds}
        onKindsChange={setKinds}
        selectedStatuses={statuses}
        onStatusesChange={setStatuses}
        onCreateClick={onCreate}
        canCreate={true}
        isAdmin={true /* подставить реальную роль */}
      />
      <ShipmentsList
        initialQuery={query}
        onEmptyCTA={onCreate}
      />
    </div>
  );
}
