'use client';
import { usePartnerShipments } from '@/lib/partners/usePartnerShipments';
import { BackButton } from '@/components/layout/BackButton';
import PartnerHeader from './components/PartnerHeader';
import FilterBar from './components/FilterBar';
import PartnerShipmentsList from './components/PartnerShipmentsList';
import { useRouter } from 'next/navigation';
import { PARTNER_SHIPMENTS_V1_ENABLED } from '@/lib/flags';

export default function PartnerShipmentsPage({ params: { partnerId } }: { params: { partnerId: string } }) {
  const p = usePartnerShipments(partnerId);
  const r = useRouter();

  if (!PARTNER_SHIPMENTS_V1_ENABLED) {
    return (
      <div className="px-4 py-3">
        <div className="text-sm text-gray-500">Partner shipments feature is disabled</div>
      </div>
    );
  }

  if (!p.guard) return <div className="p-4">Loading…</div>;

  return (
    <div className="px-4 py-3 space-y-3">
      {/* Заголовок с кнопкой назад */}
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <h1 className="text-lg font-semibold">Отгрузки партнера</h1>
      </div>

      <PartnerHeader info={p.info} />
      <FilterBar
        q={p.q} onQ={p.setQ}
        status={p.status} onStatus={p.setStatus}
        onCreateShipment={() => r.push('/shipments/new?partner=' + partnerId)}
        onCreateRequest={() => r.push('/requests/new?admin=' + partnerId)}
        can={p.can}
      />
      <PartnerShipmentsList
        items={p.items}
        onLoadMore={() => p.load(false)}
        hasMore={p.hasMore}
        loading={p.loading}
      />
    </div>
  );
}

