'use client';
import { useEffect, useMemo, useState } from 'react';
import Field from '@/components/forms/Field';
import PackTypeSelect from '@/components/forms/PackTypeSelect';
import AttachmentPicker from '@/components/forms/AttachmentPicker';
import { baseSchema, type BaseFormInput } from '@/lib/forms/validators';
import { loadDraft, saveDraft, clearDraft } from '@/lib/forms/drafts';
import { uploadAttachment, createRequest } from '@/lib/forms/api';
import { useRouter } from 'next/navigation';
import { FORMS_V2_ENABLED } from '@/lib/flags';

const FORM_KEY = 'request_new_v2';

export default function RequestNewPage() {
  const enabled = FORMS_V2_ENABLED; // можно отрендерить legacy, если false
  const router = useRouter();

  const draft = useMemo(() => loadDraft<BaseFormInput>(FORM_KEY), []);
  const [form, setForm] = useState<BaseFormInput>(() => draft ?? {
    partnerName: '', shortDesc: '', oldTracking: '', packType: 'SCOTCH_BAG', arrivalAddress: '', attachmentId: undefined,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BaseFormInput, string>>>({});
  const [busy, setBusy] = useState(false);
  const [tosAgree, setTosAgree] = useState(true); // пример чекбокса бизнес-правил

  // авто-сохранение черновика
  useEffect(() => { saveDraft(FORM_KEY, form); }, [form]);

  // подтверждение при уходе со страницы если есть несохранённые изменения
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  const setField = <K extends keyof BaseFormInput>(k: K, v: BaseFormInput[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const submit = async () => {
    setBusy(true);
    setErrors({});
    try {
      const parsed = baseSchema.safeParse(form);
      if (!parsed.success) {
        const e: any = {};
        parsed.error.issues.forEach(i => { e[i.path[0]] = i.message; });
        setErrors(e);
        return;
      }
      if (!tosAgree) { alert('Подтвердите согласие с правилами'); return; }

      const res = await createRequest(parsed.data);
      clearDraft(FORM_KEY);
      router.replace(`/chat/${res.id}`); // или /shipments?tab=requests
    } finally {
      setBusy(false);
    }
  };

  if (!enabled) return <div className="p-6 text-sm text-gray-500">Legacy request form</div>;

  return (
    <div className="px-4 pb-[72px] pt-[12px] max-w-[720px] mx-auto space-y-4">
      <h1 className="text-lg font-semibold">Новый запрос</h1>

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
            placeholder="Что нужно сделать? (1 строка)"
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

        <Field label="Вложение" hint="Необязательно: фото/схема/PDF">
          <AttachmentPicker
            value={form.attachmentId}
            onChange={(id) => setField('attachmentId', id)}
            uploader={uploadAttachment}
          />
        </Field>

        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={tosAgree} onChange={(e) => setTosAgree(e.target.checked)} />
          Подтверждаю корректность данных
        </label>

        <div className="flex gap-2 pt-2">
          <button
            className="h-11 px-4 rounded-xl bg-[var(--brand)] text-white disabled:opacity-50"
            disabled={busy}
            onClick={submit}
          >Отправить запрос</button>

          <button
            className="h-11 px-4 rounded-xl border"
            onClick={() => { clearDraft(FORM_KEY); history.back(); }}
          >Отмена</button>
        </div>
      </div>
    </div>
  );
}


