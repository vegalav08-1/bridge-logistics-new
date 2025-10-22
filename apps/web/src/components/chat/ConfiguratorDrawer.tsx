'use client';

import React, { useState } from 'react';
import { Calculator, Plus, Trash2, Send, X } from 'lucide-react';
import { CargoBox, ChatConfigurator } from '@/lib/chat/configurator';

interface ConfiguratorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (result: any) => void;
}

export function ConfiguratorDrawer({ isOpen, onClose, onPublish }: ConfiguratorDrawerProps) {
  const [boxes, setBoxes] = useState<CargoBox[]>([
    { l: 0, w: 0, h: 0, weight: 0, qty: 1 }
  ]);
  const [divisor, setDivisor] = useState(5000);
  const [note, setNote] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const addBox = () => {
    setBoxes([...boxes, { l: 0, w: 0, h: 0, weight: 0, qty: 1 }]);
  };

  const removeBox = (index: number) => {
    if (boxes.length > 1) {
      setBoxes(boxes.filter((_, i) => i !== index));
    }
  };

  const updateBox = (index: number, field: keyof CargoBox, value: number) => {
    const newBoxes = [...boxes];
    newBoxes[index] = { ...newBoxes[index], [field]: value };
    setBoxes(newBoxes);
  };

  const calculate = async () => {
    setLoading(true);
    try {
      const result = ChatConfigurator.calculate(boxes, divisor);
      setResult(result);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ошибка расчёта');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => {
    if (result) {
      onPublish({ result, note });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold">Конфигуратор груза</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-4 space-y-6">
            {/* Transport mode */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Режим перевозки
              </label>
              <select
                value={divisor}
                onChange={(e) => setDivisor(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value={5000}>Авиа (5000)</option>
                <option value={6000}>Морской (6000)</option>
                <option value={3000}>Авто/ЖД (3000)</option>
              </select>
            </div>

            {/* Boxes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Коробки</label>
                <button
                  onClick={addBox}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                >
                  <Plus className="h-4 w-4" />
                  Добавить
                </button>
              </div>

              <div className="space-y-3">
                {boxes.map((box, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Коробка {index + 1}</span>
                      {boxes.length > 1 && (
                        <button
                          onClick={() => removeBox(index)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Длина (см)</label>
                        <input
                          type="number"
                          value={box.l}
                          onChange={(e) => updateBox(index, 'l', Number(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Ширина (см)</label>
                        <input
                          type="number"
                          value={box.w}
                          onChange={(e) => updateBox(index, 'w', Number(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Высота (см)</label>
                        <input
                          type="number"
                          value={box.h}
                          onChange={(e) => updateBox(index, 'h', Number(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Вес (кг)</label>
                        <input
                          type="number"
                          value={box.weight}
                          onChange={(e) => updateBox(index, 'weight', Number(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">Количество</label>
                        <input
                          type="number"
                          value={box.qty}
                          onChange={(e) => updateBox(index, 'qty', Number(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          placeholder="1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculate button */}
            <button
              onClick={calculate}
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Расчёт...' : 'Рассчитать'}
            </button>

            {/* Result */}
            {result && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-3">Результат расчёта</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Общий объём:</span>
                    <span className="font-medium">{result.totalVolumeM3.toFixed(2)} м³</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Фактический вес:</span>
                    <span className="font-medium">{result.totalWeightKg.toFixed(0)} кг</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Расчётный вес:</span>
                    <span className="font-medium">{result.chargeableWeightKg.toFixed(0)} кг</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Плотность:</span>
                    <span className="font-medium">{result.densityKgM3.toFixed(0)} кг/м³</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white border border-gray-200 rounded">
                  <p className="text-sm text-gray-700">{result.summary}</p>
                </div>
              </div>
            )}

            {/* Note */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Примечание (необязательно)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Дополнительная информация..."
              />
            </div>

            {/* Publish button */}
            {result && (
              <button
                onClick={handlePublish}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                Опубликовать в чат
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
