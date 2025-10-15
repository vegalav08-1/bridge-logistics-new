'use client';
import { useRef, useState } from 'react';
import { Paperclip, X } from 'lucide-react';

type Props = {
  value?: string;                     // attachmentId
  onChange?: (id?: string) => void;
  uploader?: (f: File) => Promise<string>; // вернёт attachmentId
};

export default function AttachmentPicker({ value, onChange, uploader }: Props) {
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const pick = () => inputRef.current?.click();

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={async (e) => {
          const f = e.currentTarget.files?.[0];
          e.currentTarget.value = '';
          if (!f || !uploader) return;
          setBusy(true);
          try {
            const id = await uploader(f);
            setName(f.name);
            onChange?.(id);
          } finally {
            setBusy(false);
          }
        }}
      />
      {!value ? (
        <button type="button" className="h-10 px-3 rounded-xl border inline-flex items-center gap-2" onClick={pick} disabled={busy}>
          <Paperclip className="h-4 w-4" />
          {busy ? 'Загрузка…' : 'Прикрепить файл (опц.)'}
        </button>
      ) : (
        <div className="h-10 px-3 rounded-xl border inline-flex items-center gap-2">
          <Paperclip className="h-4 w-4" />
          <span className="text-sm">{name ?? 'Файл прикреплён'}</span>
          <button type="button" className="ml-2 h-7 w-7 grid place-items-center rounded-lg hover:bg-[var(--muted)]" onClick={() => onChange?.(undefined)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}


