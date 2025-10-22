import { z } from 'zod';

/**
 * Shipment status enum
 */
export const shipmentStatusSchema = z.enum([
  'NEW',
  'CONFIRMED', 
  'PICKUP_SCHEDULED',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED'
]);

/**
 * Incoterms validation
 */
export const incotermsSchema = z.enum([
  'EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'
]);

/**
 * Service level validation
 */
export const serviceLevelSchema = z.enum([
  'EXPRESS',
  'STANDARD', 
  'ECONOMY'
]);

/**
 * Package type validation
 */
export const packageTypeSchema = z.enum([
  'BOX',
  'BAG',
  'PALLET',
  'WOODEN_CRATE',
  'CARTON',
  'OTHER'
]);

/**
 * Dangerous goods class validation
 */
export const dgrClassSchema = z.enum([
  '1', '2', '3', '4', '5', '6', '7', '8', '9'
]);

/**
 * Address schema
 */
export const addressSchema = z.object({
  company_name: z.string().optional(),
  contact_name: z.string().optional(),
  country: z.string().length(2),
  city: z.string().min(2),
  zip: z.string().optional(),
  address_line1: z.string().min(3),
  address_line2: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

/**
 * Cargo item schema
 */
export const cargoItemSchema = z.object({
  description: z.string().min(3, 'Описание груза обязательно'),
  length: z.number().positive('Длина должна быть положительной'),
  width: z.number().positive('Ширина должна быть положительной'),
  height: z.number().positive('Высота должна быть положительной'),
  weight: z.number().positive('Вес должен быть положительным'),
  package_type: packageTypeSchema,
  quantity: z.number().int().positive('Количество должно быть положительным'),
  volume_weight: z.number().optional(), // calculated
});

/**
 * Dangerous goods schema
 */
export const dangerousGoodsSchema = z.object({
  is_dangerous: z.boolean(),
  un_number: z.string().optional(),
  dgr_class: dgrClassSchema.optional(),
  packing_group: z.string().optional(),
  proper_shipping_name: z.string().optional(),
});

/**
 * Customs schema
 */
export const customsSchema = z.object({
  hs_code: z.string().regex(/^\d{6,10}$/, 'HS код должен содержать 6-10 цифр'),
  country_of_origin: z.string().length(2),
  commercial_value: z.number().positive('Стоимость должна быть положительной'),
  currency: z.string().length(3),
  quantity: z.number().int().positive(),
  unit_of_measure: z.string().default('PCE'),
});

/**
 * Time window schema
 */
export const timeWindowSchema = z.object({
  ready_date: z.string(), // ISO date
  pickup_start: z.string().optional(), // ISO datetime
  pickup_end: z.string().optional(), // ISO datetime
  delivery_start: z.string().optional(), // ISO datetime
  delivery_end: z.string().optional(), // ISO datetime
});

/**
 * Main shipment creation schema
 */
export const createShipmentSchema = z.object({
  // Parties
  sender: addressSchema,
  receiver: addressSchema,
  duty_payer: z.enum(['SENDER', 'RECEIVER', 'THIRD_PARTY']),
  
  // Transport parameters
  incoterms: incotermsSchema,
  incoterms_city: z.string().min(2),
  service_level: serviceLevelSchema,
  time_windows: timeWindowSchema,
  
  // Insurance
  insurance_required: z.boolean(),
  declared_value: z.number().positive().optional(),
  insurance_currency: z.string().length(3).optional(),
  
  // Cargo
  cargo_items: z.array(cargoItemSchema).min(1, 'Должен быть указан хотя бы один груз'),
  dangerous_goods: dangerousGoodsSchema,
  
  // Customs
  customs: customsSchema,
  
  // Preferences
  preferred_carrier: z.string().optional(),
  special_instructions: z.string().optional(),
  webhook_url: z.string().url().optional(),
  notification_email: z.string().email().optional(),
});

/**
 * Shipment number format validation
 */
export const shipmentNumberSchema = z.string().regex(
  /^BR\d{8}_\d+_\d+\(\d{3,6}\)$/,
  'Неверный формат номера отгрузки'
);

/**
 * Shipment types
 */
export type ShipmentStatus = z.infer<typeof shipmentStatusSchema>;
export type Incoterms = z.infer<typeof incotermsSchema>;
export type ServiceLevel = z.infer<typeof serviceLevelSchema>;
export type PackageType = z.infer<typeof packageTypeSchema>;
export type DgrClass = z.infer<typeof dgrClassSchema>;

export type Address = z.infer<typeof addressSchema>;
export type CargoItem = z.infer<typeof cargoItemSchema>;
export type DangerousGoods = z.infer<typeof dangerousGoodsSchema>;
export type Customs = z.infer<typeof customsSchema>;
export type TimeWindow = z.infer<typeof timeWindowSchema>;

export type CreateShipmentRequest = z.infer<typeof createShipmentSchema>;
export type ShipmentNumber = z.infer<typeof shipmentNumberSchema>;

/**
 * Full shipment entity
 */
export type Shipment = {
  id: string;
  number: ShipmentNumber;
  account_id: string;
  client_code: string; // snapshot from profile
  status: ShipmentStatus;
  created_at: string;
  updated_at: string;
  
  // All the form data
  sender: Address;
  receiver: Address;
  duty_payer: 'SENDER' | 'RECEIVER' | 'THIRD_PARTY';
  incoterms: Incoterms;
  incoterms_city: string;
  service_level: ServiceLevel;
  time_windows: TimeWindow;
  insurance_required: boolean;
  declared_value?: number;
  insurance_currency?: string;
  cargo_items: CargoItem[];
  dangerous_goods: DangerousGoods;
  customs: Customs;
  preferred_carrier?: string;
  special_instructions?: string;
  webhook_url?: string;
  notification_email?: string;
};

/**
 * Shipment number generation
 */
export type ShipmentNumberComponents = {
  date: string; // YYYYMMDD
  sequence: number;
  boxes: number;
  client_code: string;
};

/**
 * Volume weight calculation
 */
export type VolumeWeightCalculation = {
  actual_weight: number;
  volume_weight: number;
  chargeable_weight: number; // max of actual and volume
  volume_factor: number; // typically 5000 for air, 6000 for sea
};
