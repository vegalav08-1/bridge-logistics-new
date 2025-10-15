export type WarehouseAddress = {
  id: string;
  label: string;          // "Склад Москва (Тверская, 1)"
  address: string;
  phone?: string;
};

export type Settings = {
  profile: {
    companyName?: string;
    contactName?: string;
    phone?: string;
    email?: string;
  };
  defaultCity?: string;               // City (по макету)
  shippingType?: 'AIR'|'SEA'|'TRUCK'|'RAIL'|'COURIER'; // Type of Shipping
  receiptAddress?: string;            // адрес выдачи клиенту (свободная строка)
  warehouses: WarehouseAddress[];     // Warehouse address (мульти)
};


