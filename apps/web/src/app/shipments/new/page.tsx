'use client';
import { useMemo, useState, useEffect } from 'react';
import Field from '@/components/forms/Field';
import PackTypeSelect from '@/components/forms/PackTypeSelect';
import AttachmentPicker from '@/components/forms/AttachmentPicker';
import { shipmentSchema, type ShipmentFormInput } from '@/lib/forms/validators';
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
    partnerName: '', shortDesc: '', oldTracking: '',
    packType: 'SCOTCH_BAG', arrivalAddress: '',
    totalWeightKg: undefined, totalVolumeM3: undefined, boxesCount: undefined,
    attachmentId: undefined,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ShipmentFormInput, string>>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => { saveDraft(FORM_KEY, form); }, [form]);
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
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
        const e: any = {};
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
    <div className="px-4 pb-[72px] pt-[12px] max-w-[720px] mx-auto space-y-4">
      <h1 className="text-lg font-semibold">Новая отгрузка</h1>

      <div className="rounded-2xl border p-4 space-y-4 bg-white">
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

        <Field label="Старый трек-номер" required error={errors.oldTracking}>
          <input
            value={form.oldTracking}
            onChange={(e) => setField('oldTracking', e.target.value)}
            placeholder="Например, LP123456789CN"
            className="w-full h-11 rounded-xl border px-3"
          />
        </Field>

        <Field label="Тип упаковки" required error={errors.packType}>
          <PackTypeSelect
            value={form.packType}
            onChange={(v) => setField('packType', v)}
            error={errors.packType}
          />
        </Field>

        <Field label="Адрес прибытия" required error={errors.arrivalAddress}>
          <textarea
            value={form.arrivalAddress}
            onChange={(e) => setField('arrivalAddress', e.target.value)}
            placeholder="Город, улица, ориентир..."
            rows={3}
            className="w-full rounded-xl border px-3 py-2"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Вес, кг" hint="Опционально" error={errors.totalWeightKg}>
            <input
              inputMode="decimal"
              value={form.totalWeightKg ?? ''}
              onChange={(e) => setField('totalWeightKg', e.target.value as any)}
              placeholder="например, 12.5"
              className="w-full h-11 rounded-xl border px-3"
            />
          </Field>
          <Field label="Объём, м³" hint="Опционально" error={errors.totalVolumeM3}>
            <input
              inputMode="decimal"
              value={form.totalVolumeM3 ?? ''}
              onChange={(e) => setField('totalVolumeM3', e.target.value as any)}
              placeholder="например, 0.08"
              className="w-full h-11 rounded-xl border px-3"
            />
          </Field>
          <Field label="Коробок, шт." hint="Опционально" error={errors.boxesCount}>
            <input
              inputMode="numeric"
              value={form.boxesCount ?? ''}
              onChange={(e) => setField('boxesCount', e.target.value as any)}
              placeholder="например, 3"
              className="w-full h-11 rounded-xl border px-3"
            />
          </Field>
        </div>

        <Field label="Вложение" hint="Необязательно: фото/схема/PDF">
          <AttachmentPicker
            value={form.attachmentId}
            onChange={(id) => setField('attachmentId', id)}
            uploader={uploadAttachment}
          />
        </Field>

        <div className="flex gap-2 pt-2">
          <button
            className="h-11 px-4 rounded-xl bg-[var(--brand)] text-white disabled:opacity-50"
            disabled={busy}
            onClick={submit}
          >Создать отгрузку</button>

          <button
            className="h-11 px-4 rounded-xl border"
            onClick={() => { clearDraft(FORM_KEY); history.back(); }}
          >Отмена</button>
        </div>
      </div>
    </div>
  );
}