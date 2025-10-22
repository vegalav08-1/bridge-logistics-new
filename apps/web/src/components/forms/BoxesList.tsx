'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import type { BoxInput } from '@/lib/forms/validators';
import SinglePhotoThumbnail from './SinglePhotoThumbnail';

interface BoxesListProps {
  boxes: BoxInput[];
  onChange: (boxes: BoxInput[]) => void;
  onTotalVolumeChange: (totalVolume: number) => void;
  errors?: Record<string, string>;
}

export default function BoxesList({ boxes, onChange, onTotalVolumeChange, errors }: BoxesListProps) {
  const [collapsedBoxes, setCollapsedBoxes] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addBox = () => {
    const newBox: BoxInput = {
      id: `box_${Date.now()}`,
      name: '',
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
      },
      photo: undefined,
    };
    onChange([...(boxes || []), newBox]);
  };

  const removeBox = (id: string) => {
    const newBoxes = (boxes || []).filter(box => box.id !== id);
    onChange(newBoxes);
    calculateTotalVolume(newBoxes);
  };

  const updateBox = (id: string, field: string, value: any) => {
    const newBoxes = (boxes || []).map(box => {
      if (box.id === id) {
        if (field.startsWith('dimensions.')) {
          const dimensionField = field.split('.')[1] as keyof BoxInput['dimensions'];
          return { 
            ...box, 
            dimensions: { 
              ...box.dimensions, 
              [dimensionField]: value 
            } 
          };
        } else {
          return { ...box, [field]: value };
        }
      }
      return box;
    });
    onChange(newBoxes);
    calculateTotalVolume(newBoxes);
  };

  const calculateTotalVolume = (boxesList: BoxInput[]) => {
    const total = (boxesList || []).reduce((sum, box) => {
      const volume = (box.dimensions.length || 0) * (box.dimensions.width || 0) * (box.dimensions.height || 0);
      return sum + volume;
    }, 0);
    onTotalVolumeChange(total / 1000000); // Конвертируем в м³
  };

  const toggleCollapse = (boxId: string) => {
    setCollapsedBoxes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(boxId)) {
        newSet.delete(boxId);
      } else {
        newSet.add(boxId);
      }
      return newSet;
    });
  };

  const isBoxCollapsed = (boxId: string) => collapsedBoxes.has(boxId);

  const calculateBoxVolume = (box: BoxInput) => {
    const volume = (box.dimensions.length || 0) * (box.dimensions.width || 0) * (box.dimensions.height || 0);
    return volume / 1000000; // Конвертируем в м³
  };

  const hasContent = (box: BoxInput) => {
    return box.name?.trim() || 
           box.dimensions.length || 
           box.dimensions.width || 
           box.dimensions.height || 
           box.photo;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Посылки</h3>
        <button
          type="button"
          onClick={addBox}
          className="flex items-center gap-1 px-2 py-1 bg-[var(--brand)] text-white rounded-md hover:bg-[var(--brand-dark)] transition-all duration-200 hover:scale-[1.02] text-sm"
        >
          <Plus className="h-3 w-3" />
          Добавить посылку
        </button>
      </div>

      {(boxes || []).map((box, index) => {
        const isCollapsed = isBoxCollapsed(box.id);
        const hasBoxContent = hasContent(box);
        const volume = calculateBoxVolume(box);

        return (
          <div key={box.id} className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
            {/* Заголовок посылки - кликабельный для сворачивания */}
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleCollapse(box.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <SinglePhotoThumbnail
                    photoUrl={box.photo}
                    onPhotoChange={(photoUrl) => updateBox(box.id, 'photo', photoUrl)}
                    itemId={box.id}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {mounted && box.name ? box.name : `Посылка ${index + 1}`}
                      </h4>
                      <div className="text-xs text-gray-500 mt-1">
                        {box.dimensions.length || 0} × {box.dimensions.width || 0} × {box.dimensions.height || 0} см = <span className="font-semibold text-blue-600">{volume.toFixed(3)} м³</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCollapse(box.id);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                        title={isCollapsed ? "Развернуть" : "Свернуть"}
                      >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBox(box.id);
                        }}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        title="Удалить посылку"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Содержимое посылки - сворачиваемое, НЕ кликабельное для открытия/закрытия */}
            {!isCollapsed && (
              <div className="mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 pb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Наименование
                    </label>
                    <input
                      type="text"
                      value={box.name || ''}
                      onChange={(e) => updateBox(box.id, 'name', e.target.value)}
                      className="w-full h-8 rounded-lg border px-2 text-sm border-gray-300"
                      placeholder="Название посылки"
                    />
                    {(errors || {})[`boxes.${index}.name`] && (
                      <p className="text-red-500 text-xs mt-1">{(errors || {})[`boxes.${index}.name`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Длина (см)
                    </label>
                    <input
                      type="number"
                      value={box.dimensions.length || ''}
                      onChange={(e) => updateBox(box.id, 'dimensions.length', parseFloat(e.target.value) || 0)}
                      className="w-full h-8 rounded-lg border px-2 text-sm border-gray-300"
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Ширина (см)
                    </label>
                    <input
                      type="number"
                      value={box.dimensions.width || ''}
                      onChange={(e) => updateBox(box.id, 'dimensions.width', parseFloat(e.target.value) || 0)}
                      className="w-full h-8 rounded-lg border px-2 text-sm border-gray-300"
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Высота (см)
                    </label>
                    <input
                      type="number"
                      value={box.dimensions.height || ''}
                      onChange={(e) => updateBox(box.id, 'dimensions.height', parseFloat(e.target.value) || 0)}
                      className="w-full h-8 rounded-lg border px-2 text-sm border-gray-300"
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Вес (кг)
                    </label>
                    <input
                      type="number"
                      value={box.weight || ''}
                      onChange={(e) => updateBox(box.id, 'weight', parseFloat(e.target.value) || 0)}
                      className="w-full h-8 rounded-lg border px-2 text-sm border-gray-300"
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

    </div>
  );
}