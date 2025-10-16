'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FLAGS } from '@yp/shared';

interface Parcel3DViewerProps {
  length?: number;
  width?: number;
  height?: number;
  kind: 'box' | 'pallet' | 'crating';
  onClose: () => void;
}

export function Parcel3DViewer({ length, width, height, kind, onClose }: Parcel3DViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Проверяем доступность функции
  if (!FLAGS.PACK_3D_ENABLED) {
    return null;
  }

  useEffect(() => {
    if (!length || !width || !height) {
      setError('Недостаточно данных для 3D визуализации');
      return;
    }

    // Простая 3D визуализация с помощью Canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Настройки
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 2; // Масштаб для визуализации

    // Нормализуем размеры для отображения (максимальная сторона = 100px)
    const maxSize = Math.max(length, width, height);
    const normalizedLength = (length / maxSize) * 100 * scale;
    const normalizedWidth = (width / maxSize) * 100 * scale;
    const normalizedHeight = (height / maxSize) * 100 * scale;

    // Цвета в зависимости от типа
    const colors = {
      box: { fill: '#3B82F6', stroke: '#1E40AF' },
      pallet: { fill: '#10B981', stroke: '#047857' },
      crating: { fill: '#F59E0B', stroke: '#D97706' }
    };

    const color = colors[kind] || colors.box;

    // Рисуем 3D коробку (изометрическая проекция)
    draw3DBox(ctx, centerX, centerY, normalizedLength, normalizedWidth, normalizedHeight, color);

    // Добавляем подписи
    ctx.fillStyle = '#374151';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${length}×${width}×${height} см`, centerX, centerY + normalizedHeight / 2 + 30);
    ctx.fillText(`Объем: ${((length * width * height) / 1000000).toFixed(4)} м³`, centerX, centerY + normalizedHeight / 2 + 45);

    setIsLoaded(true);
  }, [length, width, height, kind]);

  const draw3DBox = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    length: number,
    width: number,
    height: number,
    color: { fill: string; stroke: string }
  ) => {
    // Изометрическая проекция
    const isoAngle = Math.PI / 6; // 30 градусов
    const cos = Math.cos(isoAngle);
    const sin = Math.sin(isoAngle);

    // Вершины коробки
    const vertices = [
      // Передняя грань
      { x: x - length/2, y: y - height/2 },
      { x: x + length/2, y: y - height/2 },
      { x: x + length/2, y: y + height/2 },
      { x: x - length/2, y: y + height/2 },
      // Задняя грань (смещена по изометрии)
      { x: x - length/2 + width * cos, y: y - height/2 - width * sin },
      { x: x + length/2 + width * cos, y: y - height/2 - width * sin },
      { x: x + length/2 + width * cos, y: y + height/2 - width * sin },
      { x: x - length/2 + width * cos, y: y + height/2 - width * sin }
    ];

    // Рисуем грани
    ctx.fillStyle = color.fill;
    ctx.strokeStyle = color.stroke;
    ctx.lineWidth = 2;

    // Передняя грань
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    ctx.lineTo(vertices[1].x, vertices[1].y);
    ctx.lineTo(vertices[2].x, vertices[2].y);
    ctx.lineTo(vertices[3].x, vertices[3].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Задняя грань
    ctx.beginPath();
    ctx.moveTo(vertices[4].x, vertices[4].y);
    ctx.lineTo(vertices[5].x, vertices[5].y);
    ctx.lineTo(vertices[6].x, vertices[6].y);
    ctx.lineTo(vertices[7].x, vertices[7].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Боковые грани
    // Левая
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    ctx.lineTo(vertices[4].x, vertices[4].y);
    ctx.lineTo(vertices[7].x, vertices[7].y);
    ctx.lineTo(vertices[3].x, vertices[3].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Правая
    ctx.beginPath();
    ctx.moveTo(vertices[1].x, vertices[1].y);
    ctx.lineTo(vertices[5].x, vertices[5].y);
    ctx.lineTo(vertices[6].x, vertices[6].y);
    ctx.lineTo(vertices[2].x, vertices[2].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Верхняя
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    ctx.lineTo(vertices[1].x, vertices[1].y);
    ctx.lineTo(vertices[5].x, vertices[5].y);
    ctx.lineTo(vertices[4].x, vertices[4].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Нижняя
    ctx.beginPath();
    ctx.moveTo(vertices[3].x, vertices[3].y);
    ctx.lineTo(vertices[2].x, vertices[2].y);
    ctx.lineTo(vertices[6].x, vertices[6].y);
    ctx.lineTo(vertices[7].x, vertices[7].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Ошибка 3D визуализации</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">3D визуализация упаковки</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* 3D Canvas */}
        <div className="p-4">
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              className="border border-gray-300 rounded"
            />
          </div>
          
          {!isLoaded && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Загрузка 3D модели...</p>
            </div>
          )}

          {/* Информация */}
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Размеры: {length}×{width}×{height} см</p>
            <p>Тип: {
              kind === 'box' ? 'Коробка' :
              kind === 'pallet' ? 'Палета' : 'Обрешетка'
            }</p>
            <p>Объем: {((length! * width! * height!) / 1000000).toFixed(4)} м³</p>
          </div>
        </div>

        {/* Кнопки */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}





