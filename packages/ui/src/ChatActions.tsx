import React, { useState } from 'react';

interface ChatActionsProps {
  chatType: 'REQUEST' | 'SHIPMENT';
  chatStatus: string;
  userRole: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  hasOffer: boolean;
  isArchived: boolean;
  onOfferCreate: (offerData: any) => Promise<void>;
  onOfferAccept: (offerId: string) => Promise<void>;
  onRequestArchive: (requestId: string) => Promise<void>;
  onRequestDuplicate: (requestId: string) => Promise<void>;
  onShipmentReceive: (mode: 'full' | 'partial', notes?: string) => Promise<void>;
  requestId?: string;
  offerId?: string;
  shipmentId?: string;
}

export function ChatActions({
  chatType,
  chatStatus,
  userRole,
  hasOffer,
  isArchived,
  onOfferCreate,
  onOfferAccept,
  onRequestArchive,
  onRequestDuplicate,
  onShipmentReceive,
  requestId,
  offerId,
  shipmentId,
}: ChatActionsProps) {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Если чат архивирован, показываем только кнопку редактирования
  if (isArchived && chatType === 'REQUEST') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">Запрос архивирован</p>
          <button
            onClick={() => requestId && onRequestDuplicate(requestId)}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Создание...' : 'Редактировать'}
          </button>
        </div>
      </div>
    );
  }

  // Администратор в запросе без оффера
  if (userRole === 'ADMIN' && chatType === 'REQUEST' && chatStatus === 'REQUEST' && !hasOffer) {
    return (
      <>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <p className="text-sm text-blue-700 mb-3">Создайте предложение для пользователя</p>
            <button
              onClick={() => setShowOfferModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Создать оффер
            </button>
          </div>
        </div>

        {showOfferModal && (
          <OfferModal
            onClose={() => setShowOfferModal(false)}
            onSubmit={onOfferCreate}
            isLoading={isLoading}
          />
        )}
      </>
    );
  }

  // Пользователь в запросе с оффером
  if (userRole === 'USER' && chatType === 'REQUEST' && chatStatus === 'REQUEST' && hasOffer) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="space-y-3">
          <p className="text-sm text-green-700 text-center">У вас есть предложение от администратора</p>
          <div className="flex space-x-3">
            <button
              onClick={() => offerId && onOfferAccept(offerId)}
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Создание...' : 'Создать отгрузку из ответа'}
            </button>
            <button
              onClick={() => requestId && onRequestArchive(requestId)}
              disabled={isLoading}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Архивировать
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Администратор в отгрузке со статусом NEW
  if (userRole === 'ADMIN' && chatType === 'SHIPMENT' && chatStatus === 'NEW') {
    return (
      <>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-center">
            <p className="text-sm text-yellow-700 mb-3">Груз ожидает приёмки</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowReceiveModal(true)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Груз принят
              </button>
              <button
                onClick={() => setShowReceiveModal(true)}
                className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                Частично
              </button>
            </div>
          </div>
        </div>

        {showReceiveModal && (
          <ReceiveModal
            onClose={() => setShowReceiveModal(false)}
            onSubmit={onShipmentReceive}
            isLoading={isLoading}
          />
        )}
      </>
    );
  }

  return null;
}

// Модальное окно для создания оффера
function OfferModal({ onClose, onSubmit, isLoading }: {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    pricePerKgUSD: '',
    insuranceUSD: '',
    packingUSD: '',
    deliveryDays: '',
    deliveryMethod: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.pricePerKgUSD) {
      newErrors.pricePerKgUSD = 'Цена за кг обязательна';
    } else {
      const price = parseFloat(formData.pricePerKgUSD);
      if (isNaN(price) || price <= 0) {
        newErrors.pricePerKgUSD = 'Цена должна быть положительной';
      }
    }

    if (formData.insuranceUSD) {
      const insurance = parseFloat(formData.insuranceUSD);
      if (isNaN(insurance) || insurance < 0) {
        newErrors.insuranceUSD = 'Страховая сумма не может быть отрицательной';
      }
    }

    if (formData.packingUSD) {
      const packing = parseFloat(formData.packingUSD);
      if (isNaN(packing) || packing < 0) {
        newErrors.packingUSD = 'Стоимость упаковки не может быть отрицательной';
      }
    }

    if (formData.deliveryDays) {
      const days = parseInt(formData.deliveryDays);
      if (isNaN(days) || days < 1 || days > 90) {
        newErrors.deliveryDays = 'Срок доставки должен быть от 1 до 90 дней';
      }
    }

    if (formData.notes && formData.notes.length > 180) {
      newErrors.notes = 'Примечания не должны превышать 180 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      pricePerKgUSD: parseFloat(formData.pricePerKgUSD),
      insuranceUSD: formData.insuranceUSD ? parseFloat(formData.insuranceUSD) : undefined,
      packingUSD: formData.packingUSD ? parseFloat(formData.packingUSD) : undefined,
      deliveryDays: formData.deliveryDays ? parseInt(formData.deliveryDays) : undefined,
      deliveryMethod: formData.deliveryMethod || undefined,
      notes: formData.notes || undefined,
    };

    await onSubmit(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Создать предложение</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Цена за кг (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.pricePerKgUSD}
                onChange={(e) => setFormData(prev => ({ ...prev, pricePerKgUSD: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.pricePerKgUSD ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.pricePerKgUSD && (
                <p className="mt-1 text-sm text-red-600">{errors.pricePerKgUSD}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Страховка (USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.insuranceUSD}
                onChange={(e) => setFormData(prev => ({ ...prev, insuranceUSD: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.insuranceUSD ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.insuranceUSD && (
                <p className="mt-1 text-sm text-red-600">{errors.insuranceUSD}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Упаковка (USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.packingUSD}
                onChange={(e) => setFormData(prev => ({ ...prev, packingUSD: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.packingUSD ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.packingUSD && (
                <p className="mt-1 text-sm text-red-600">{errors.packingUSD}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Срок доставки (дни)
              </label>
              <input
                type="number"
                value={formData.deliveryDays}
                onChange={(e) => setFormData(prev => ({ ...prev, deliveryDays: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.deliveryDays ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
                min="1"
                max="90"
              />
              {errors.deliveryDays && (
                <p className="mt-1 text-sm text-red-600">{errors.deliveryDays}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Способ доставки
              </label>
              <select
                value={formData.deliveryMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, deliveryMethod: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите способ</option>
                <option value="avia">Авиа</option>
                <option value="sea">Море</option>
                <option value="express">Экспресс</option>
                <option value="ground">Наземный</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Примечания
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.notes ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Дополнительная информация"
                rows={3}
                maxLength={180}
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.notes.length}/180 символов
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'Создание...' : 'Создать предложение'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Модальное окно для приёмки груза
function ReceiveModal({ onClose, onSubmit, isLoading }: {
  onClose: () => void;
  onSubmit: (mode: 'full' | 'partial', notes?: string) => Promise<void>;
  isLoading: boolean;
}) {
  const [mode, setMode] = useState<'full' | 'partial'>('full');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(mode, notes.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Приёмка груза</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Режим приёмки
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mode"
                    value="full"
                    checked={mode === 'full'}
                    onChange={(e) => setMode(e.target.value as 'full')}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Груз принят полностью</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mode"
                    value="partial"
                    checked={mode === 'partial'}
                    onChange={(e) => setMode(e.target.value as 'partial')}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Груз принят частично</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Примечания
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Дополнительная информация о приёмке"
                rows={3}
                maxLength={200}
              />
              <p className="mt-1 text-xs text-gray-500">
                {notes.length}/200 символов
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                  mode === 'full'
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500'
                }`}
              >
                {isLoading ? 'Сохранение...' : `Подтвердить ${mode === 'full' ? 'полную' : 'частичную'} приёмку`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}







