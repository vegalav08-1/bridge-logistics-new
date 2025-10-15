import { SHIPMENTS_V2_ENABLED } from '@/lib/flags';
import ShipmentsV2Page from './v2';
import LegacyShipmentsPage from './legacy';

export default function ShipmentsPage() {
  if (SHIPMENTS_V2_ENABLED) return <ShipmentsV2Page />;
  return <LegacyShipmentsPage />;
}