'use client';
import { useMemo, useState, useEffect } from 'react';
import Field from '@/components/forms/Field';
import ItemsList from '@/components/forms/ItemsList';
// import BoxesList from '@/components/forms/BoxesList'; // Временно отключен
import ArrivalAddressSelect from '@/components/forms/ArrivalAddressSelect';
import AttachmentPicker from '@/components/forms/AttachmentPicker';
import { shipmentSchema, type ShipmentFormInput, type ItemInput, type BoxInput } from '@/lib/forms/validators';
import { loadDraft, saveDraft, clearDraft } from '@/lib/forms/drafts';
import { uploadAttachment, createShipment } from '@/lib/forms/api';
import { FORMS_V2_ENABLED } from '@/lib/flags';
import { useRouter } from 'next/navigation';

const FORM_KEY = 'shipment_new_v2';

export default function ShipmentNewPage() {
  const enabled = FORMS_V2_ENABLED;
  const router = useRouter();

  const draft = useMemo(() => loadDraft<ShipmentFormInput>(FORM_KEY), []);
  const [form, setForm] = useState<ShipmentFormInput>(() => draft ?? {
    partnerName: '', shortDesc: '',
    arrivalAddress: '',
    items: [{
      id: 'item_1',
      name: '',
      quantity: 0,
      price: 0,
      photos: [],
      oldTracking: '',
    }],
    totalCost: 0,
    totalWeightKg: undefined, totalVolumeM3: 0, boxesCount: undefined,
    boxes: [{
      id: 'box_1',
      dimensions: {
        length: undefined,
        width: undefined,
        height: undefined,
      },
      name: '',
      weight: undefined,
      photo: undefined,
    }],
    attachmentId: undefined,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ShipmentFormInput, string>>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => { saveDraft(FORM_KEY, form); }, [form]);
  useEffect(() => {
    const onBeforeUnload = (e: any) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  const setField = <K extends keyof ShipmentFormInput>(k: K, v: ShipmentFormInput[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const submit = async () => {
    setBusy(true);
    setErrors({});
    try {
      const parsed = shipmentSchema.safeParse(form);
      if (!parsed.success) {
        const e: Record<string, string> = {};
        parsed.error.issues.forEach(i => { e[i.path[0]] = i.message; });
        setErrors(e);
        return;
      }
      const res = await createShipment(parsed.data);
      clearDraft(FORM_KEY);
      router.replace(`/chat/${res.id}`);
    } finally {
      setBusy(false);
    }
  };

  if (!enabled) return <div className="p-6 text-sm text-gray-500">Legacy shipment form</div>;

  return (
    <div className="px-4 pb-[72px] pt-[12px] max-w-[720px] mx-auto space-y-6">
      <h1 className="text-lg font-semibold">Новая отгрузка</h1>

      {/* Основная информация */}
      <div className="rounded-2xl border p-4 space-y-4 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Основная информация</h2>
        
        <Field label="Партнёр" hint="Если задан из ветки — будет заполнено автоматически">
          <input
            value={form.partnerName ?? ''}
            onChange={(e) => setField('partnerName', e.target.value)}
            placeholder="Название партнёра"
            className="w-full h-11 rounded-xl border px-3"
          />
        </Field>

        <Field label="Краткое описание" required error={errors.shortDesc}>
          <input
            value={form.shortDesc}
            onChange={(e) => setField('shortDesc', e.target.value)}
            placeholder="Что за груз? (1 строка)"
            className="w-full h-11 rounded-xl border px-3"
            maxLength={120}
          />
        </Field>


        <Field label="Адрес прибытия" required error={errors.arrivalAddress}>
          <ArrivalAddressSelect
            value={form.arrivalAddress}
            onChange={(v) => setField('arrivalAddress', v)}
            error={errors.arrivalAddress}
          />
        </Field>
      </div>

      {/* Характеристики */}
      <div className="rounded-2xl border p-4 bg-white">
        

        {/* Временно отключен блок Посылки */}
        {/* <BoxesList
          boxes={form.boxes}
          onChange={(boxes) => setField('boxes', boxes)}
          onTotalVolumeChange={(totalVolume) => setField('totalVolumeM3', totalVolume)}
          errors={errors}
        /> */}
        
        {/* Временно отключены поля отображения характеристик */}
        {/* <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-1 bg-blue-50 rounded-lg">
            <div className="text-xs text-gray-600">Количество коробок:</div>
            <div className="text-sm font-semibold text-blue-700">
              {typeof window !== 'undefined' ? (form.boxes?.length || 0) : 0} шт.
            </div>
          </div>
          
          <div className="p-1 bg-green-50 rounded-lg">
            <div className="text-xs text-gray-600">Общий вес:</div>
            <div className="text-sm font-semibold text-green-700">
              {typeof window !== 'undefined' ? form.boxes?.reduce((total, box) => total + (box.weight || 0), 0).toFixed(1) : '0.0'} кг
            </div>
          </div>
          
          <div className="p-1 bg-blue-50 rounded-lg">
            <div className="text-xs text-gray-600">Общий объем:</div>
            <div className="text-sm font-semibold text-blue-700">
              {typeof window !== 'undefined' ? (form.totalVolumeM3 || 0).toFixed(3) : '0.000'} м³
            </div>
          </div>
        </div> */}
      </div>

      {/* Товары */}
      <div className="rounded-2xl border p-4 bg-white">
        <ItemsList
          items={form.items}
          onChange={(items) => setField('items', items)}
          onTotalCostChange={(totalCost) => setField('totalCost', totalCost)}
          errors={errors}
        />
        
        <div className="mt-4 p-1 bg-green-50 rounded-lg">
          <div className="text-xs text-gray-600">Общая стоимость:</div>
          <div className="text-sm font-semibold text-green-700">
            {typeof window !== 'undefined' && form.totalCost ? form.totalCost.toLocaleString('ru-RU') : '0'} ₽
          </div>
        </div>
      </div>

      {/* Файлы */}
      <div className="rounded-2xl border p-4 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Прикрепленные файлы</h2>
        <Field label="Файл" hint="Опционально">
          <AttachmentPicker
            value={form.attachmentId}
            onChange={(v) => setField('attachmentId', v)}
            uploader={uploadAttachment}
          />
        </Field>
      </div>

      {/* Кнопки */}
      <div className="flex gap-3">
        <button
          onClick={submit}
          disabled={busy}
          className="flex-1 h-11 rounded-xl bg-[var(--brand)] text-white font-medium disabled:opacity-50"
        >
          {busy ? 'Создание...' : 'Создать отгрузку'}
        </button>
        <button
          onClick={() => router.back()}
          className="px-4 h-11 rounded-xl border border-gray-300 text-gray-700"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}