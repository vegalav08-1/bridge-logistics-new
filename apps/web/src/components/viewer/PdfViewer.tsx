'use client';
import type { Annotation } from '@/lib/viewer/types';
import { useRef } from 'react';

type Props = {
  src: string;
  annotations: Annotation[];
  onAddAnnotation: (a: Omit<Annotation,'id'|'createdAtISO'>) => void;
};

export default function PdfViewer({ src, annotations, onAddAnnotation }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Простейшая разметка: iframe занимает всё пространство
  // Аннотации для PDF в этой заглушке рисуем поверх в wrap
  return (
    <div ref={wrapRef} className="absolute inset-0 bg-white">
      <iframe src={src} className="w-full h-full" />
      {/* В реальной интеграции аннотации должны привязываться к странице.
         Здесь — просто пример: клик по оверлею можно обрабатывать и
         вычислять относительные координаты, как в ImageViewer. */}
    </div>
  );
}


