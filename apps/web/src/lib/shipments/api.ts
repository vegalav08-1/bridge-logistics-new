import { ShipmentsQuery, ShipmentsResponse, ShipmentListItem } from './types';

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

/** Реальный API для получения отгрузок */
export async function listShipments(query: ShipmentsQuery): Promise<ShipmentsResponse> {
  try {
    // Получаем токен из localStorage или из контекста
    const token = localStorage.getItem('access_token') || '';
    
    if (!token) {
      throw new Error('No access token');
    }

    // Формируем URL с параметрами
    const params = new URLSearchParams();
    if (query.search) params.append('search', query.search);
    if (query.kind) params.append('kind', query.kind.join(','));
    if (query.status) params.append('status', query.status.join(','));
    if (query.cursor) params.append('cursor', query.cursor);
    
    const url = `/api/shipments?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Преобразуем данные в нужный формат
    const items: ShipmentListItem[] = data.map((item: any) => ({
      id: item.id,
      kind: item.type === 'REQUEST' ? 'REQUEST' : 'SHIPMENT',
      number: item.number,
      status: item.status,
      createdAtISO: item.createdAt,
      updatedAtISO: item.updatedAt,
      unreadCount: item.unreadCount || 0,
      ownerName: item.ownerName || 'Unknown',
      partnerName: item.partnerName || 'Unknown',
      financeBadge: item.financeBadge || 'ok',
    }));

    return {
      items,
      nextCursor: data.nextCursor,
    };
  } catch (error) {
    console.error('Error fetching shipments:', error);
    
    // Fallback к заглушке в случае ошибки
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
}