import { ShipmentsQuery, ShipmentsResponse, ShipmentListItem } from './types';

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

/** Заглушка: замените на реальный fetch к вашему API */
export async function listShipments(query: ShipmentsQuery): Promise<ShipmentsResponse> {
  // имитируем сеть
  await wait(300);

  const pageSize = 20;
  const cursorNum = query.cursor ? parseInt(query.cursor, 10) : 0;

  const makeItem = (i: number): ShipmentListItem => ({
    id: `id_${cursorNum + i}`,
    kind: i % 5 === 0 ? 'REQUEST' : 'SHIPMENT',
    number: `BR-${String(cursorNum + i).padStart(6, '0')}`,
    status: (['NEW','RECEIVE','RECONCILE','PACK','IN_TRANSIT','ON_DELIVERY','DELIVERED'] as const)[(i % 7)],
    createdAtISO: new Date(Date.now() - (i + cursorNum) * 86400000).toISOString(),
    updatedAtISO: new Date(Date.now() - (i + cursorNum) * 3600000).toISOString(),
    unreadCount: (i % 3 === 0) ? (i % 6) : 0,
    ownerName: `Client ${i}`,
    partnerName: `Admin ${i}`,
    financeBadge: i % 4 === 0 ? 'debt' : 'ok',
  });

  const items = Array.from({ length: pageSize }).map((_, i) => makeItem(i));
  const nextCursor = cursorNum + pageSize >= 200 ? undefined : String(cursorNum + pageSize);

  return { items, nextCursor };
}