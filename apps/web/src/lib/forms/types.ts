export type PackType =
  | 'SCOTCH_BAG'              // Скотч + мешок
  | 'WOOD_CORNERS'            // Деревянные уголки
  | 'WOOD_CRATE'              // Деревянная обрешётка
  | 'WOOD_BOX'                // Деревянный ящик
  | 'PALLET';                 // Палет

export const PACK_TYPES: { value: PackType; label: string; hint?: string }[] = [
  { value: 'SCOTCH_BAG',   label: 'Скотч + мешок',         hint: 'Бюджетно, базовая защита' },
  { value: 'WOOD_CORNERS', label: 'Деревянные уголки',     hint: 'Усиление кромок' },
  { value: 'WOOD_CRATE',   label: 'Деревянная обрешётка',  hint: 'Средняя защита, лёгкая' },
  { value: 'WOOD_BOX',     label: 'Деревянный ящик',       hint: 'Максимальная защита' },
  { value: 'PALLET',       label: 'Палет',                 hint: 'Стандарт для тяжёлых' },
];

export interface BaseForm {
  partnerName?: string;        // readonly если идёт от ветки/контекста
  shortDesc: string;           // 1 строка
  oldTracking: string;         // обязательный "старый трек-номер"
  packType: PackType;          // обязательный
  arrivalAddress: string;      // свободный ввод
  attachmentId?: string;       // необязательное вложение (id после загрузки)
}

export interface ShipmentForm extends BaseForm {
  totalWeightKg?: number;
  totalVolumeM3?: number;
  boxesCount?: number;
}


