'use client';
import { useEffect, useMemo, useState } from 'react';
import { X, Download, RotateCcw, ChevronLeft, ChevronRight, Layers, PencilLine, Save, Plus } from 'lucide-react';
import { fetchAnnotations, fetchAttachmentInfo, saveAnnotation, createNewVersion } from '@/lib/viewer/api';
import type { Annotation, AttachmentInfo, AttachmentVersion } from '@/lib/viewer/types';
import ImageViewer from './ImageViewer';
import PdfViewer from './PdfViewer';

type Props = {
  attachmentId: string | null;
  onClose: () => void;
};

export default function AttachmentViewer({ attachmentId, onClose }: Props) {
  const [info, setInfo] = useState<AttachmentInfo | null>(null);
  const [activeVersion, setActiveVersion] = useState<AttachmentVersion | null>(null);
  const [anns, setAnns] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true); // боковая панель версий/аннотаций

  // загрузка метаданных и аннотаций
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!attachmentId) return;
      setLoading(true);
      const meta = await fetchAttachmentInfo(attachmentId);
      if (!mounted) return;
      setInfo(meta);
      setActiveVersion(meta.versions?.[0] ?? null);
      const list = await fetchAnnotations(attachmentId, meta.versions?.[0]?.id);
      if (!mounted) return;
      setAnns(list);
      setLoading(false);
    })();
    return () => { mounted = false; setInfo(null); setAnns([]); };
  }, [attachmentId]);

  const url = useMemo(() => activeVersion?.url ?? info?.url ?? '', [activeVersion, info]);

  if (!attachmentId) return null;

  return (
    <div data-testid="viewer-root" className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm">
      {/* шапка */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-white flex items-center justify-between px-3 border-b">
        <div className="flex items-center gap-2">
          <button data-testid="viewer-close" className="h-9 w-9 grid place-items-center rounded-lg hover:bg-[var(--muted)]" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
          <div className="text-sm font-medium truncate">{info?.name}</div>
        </div>
        <div className="flex items-center gap-1">
          <button className="h-9 px-3 rounded-lg hover:bg-[var(--muted)] flex items-center gap-2" title="Скачать">
            <Download className="h-4 w-4" /> Download
          </button>
          <button className="h-9 px-3 rounded-lg hover:bg-[var(--muted)] flex items-center gap-2" title="Новая версия"
            onClick={async () => {
              // заглушка: создаём версию из текущего url (скрин)
              const blob = await fetch(url).then(r => r.blob());
              const v = await createNewVersion(attachmentId, blob, 'from viewer');
              setInfo((prev) => prev ? { ...prev, versions: [v, ...(prev.versions ?? [])] } : prev);
              setActiveVersion(v);
            }}>
            <Plus className="h-4 w-4" /> New version
          </button>
          <button className="h-9 w-9 grid place-items-center rounded-lg hover:bg-[var(--muted)]" onClick={() => setPanelOpen(v => !v)} title="Панель">
            <Layers className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* контент */}
      <div className="absolute top-12 bottom-0 left-0 right-0 flex">
        {/* основная область */}
        <div className="flex-1 bg-zinc-900 grid place-items-center relative overflow-hidden">
          {loading && <div className="text-white/80">Loading…</div>}

          {!loading && info?.kind === 'image' && (
            <ImageViewer src={url} annotations={anns} onAddAnnotation={async (a) => {
              if (!activeVersion || !info) return;
              const saved = await saveAnnotation(info.id, activeVersion.id, a);
              setAnns((p) => [...p, saved]);
            }}/>
          )}

          {!loading && info?.kind === 'pdf' && (
            <PdfViewer src={url} annotations={anns} onAddAnnotation={async (a) => {
              if (!activeVersion || !info) return;
              const saved = await saveAnnotation(info.id, activeVersion.id, a);
              setAnns((p) => [...p, saved]);
            }}/>
          )}

          {!loading && info && info.kind === 'other' && (
            <div className="text-white/80 text-sm">Просмотр не поддерживается. Используйте загрузку файла.</div>
          )}
        </div>

        {/* боковая панель */}
        {panelOpen && (
          <aside className="w-[300px] max-w-[80vw] bg-white border-l flex flex-col">
            <div className="p-3 border-b text-sm font-medium">Versions</div>
            <div className="overflow-auto max-h-[40%] divide-y">
              {(info?.versions ?? []).map(v => {
                const active = v.id === activeVersion?.id;
                return (
                  <button key={v.id}
                    className={`w-full text-left px-3 py-2 text-sm ${active ? 'bg-[var(--muted)]' : 'hover:bg-[var(--muted)]'}`}
                    onClick={async () => {
                      setActiveVersion(v);
                      const list = await fetchAnnotations(attachmentId, v.id);
                      setAnns(list);
                    }}>
                    <div className="font-medium">{v.id}</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">{new Date(v.createdAtISO).toLocaleString()} · {v.author} · {v.note}</div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t text-sm font-medium">Annotations</div>
            <div className="flex-1 overflow-auto">
              {anns.length === 0 ? (
                <div className="text-xs text-[var(--text-secondary)] px-3 py-2">Нет аннотаций</div>
              ) : (
                <ul className="text-sm">
                  {anns.map(a => (
                    <li key={a.id} className="px-3 py-2 border-b">
                      <div className="font-medium">{a.text || 'Marker'}</div>
                      <div className="text-[11px] text-[var(--text-secondary)]">{a.author || '—'} · {new Date(a.createdAtISO).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-3 border-t flex items-center gap-2">
              <PencilLine className="h-4 w-4" />
              <span className="text-xs text-[var(--text-secondary)]">Клик по изображению / странице — поставить маркер</span>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
