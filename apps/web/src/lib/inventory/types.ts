export type Unit = 'pcs'|'kg'|'m'|'set';

export type Location = {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  level: 'zone'|'rack'|'shelf'|'bin';
};

export type Item = {
  id: string;
  sku: string;
  name: string;
  unit: Unit;
  weight?: number;          // кг
  volume?: number;          // м3
  priceCost?: number;       // себестоимость
  stock: number;
  reserved: number;
  locationId?: string;
  meta?: Record<string, any>;
};

export type Package = {
  id: string;
  shipmentId: string;
  items: { itemId: string; qty: number }[];
  weight?: number;
  volume?: number;
  labelUrl?: string;
  status: 'DRAFT'|'PACKED'|'SHIPPED'|'RETURNED';
  createdAtISO: string;
};

export type InventoryAudit = {
  id: string;
  type: 'move'|'pack'|'unpack'|'restock'|'adjust';
  itemId: string;
  delta: number;
  userId: string;
  createdAtISO: string;
};

export type LabelFormat = 'QR'|'BARCODE';


