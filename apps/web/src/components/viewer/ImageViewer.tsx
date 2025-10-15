'use client';
import { useCallback, useRef, useState } from 'react';
import type { Annotation } from '@/lib/viewer/types';

type Props = {
  src: string;
  annotations: Annotation[];
  onAddAnnotation: (a: Omit<Annotation,'id'|'createdAtISO'>) => void;
};

export default function ImageViewer({ src, annotations, onAddAnnotation }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<null | { x: number; y: number }>(null);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY / 500;
    setScale((s) => Math.min(5, Math.max(0.5, s + delta)));
  };

  const onMouseDown = (e: React.MouseEvent) => { setDrag({ x: e.clientX - pos.x, y: e.clientY - pos.y }); };
  const onMouseUp = () => setDrag(null);
  const onMouseMove = (e: React.MouseEvent) => { if (drag) setPos({ x: e.clientX - drag.x, y: e.clientY - drag.y }); };

  const onAdd = useCallback((e: React.MouseEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left - pos.x) / (rect.width);
    const py = (e.clientY - rect.top - pos.y) / (rect.height);
    onAddAnnotation({ x: px / scale, y: py / scale });
  }, [onAddAnnotation, pos, scale]);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 overflow-hidden touch-pan-y"
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onDoubleClick={() => setScale(1)}
      onClick={onAdd}
      role="img"
      aria-label="Image viewer"
    >
      <img
        src={src}
        alt=""
        className="select-none pointer-events-none"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`, transformOrigin: 'top left' }}
      />
      {/* аннотации */}
      {annotations.map(a => (
        <div key={a.id}
          className="absolute h-3 w-3 rounded-full bg-amber-400 ring-2 ring-white shadow"
          style={{ left: `calc(${a.x*100}% * ${scale})`, top: `calc(${a.y*100}% * ${scale})`, transform: `translate(${pos.x}px, ${pos.y}px)` }}
          title={a.text || 'Marker'}
        />
      ))}
    </div>
  );
}


