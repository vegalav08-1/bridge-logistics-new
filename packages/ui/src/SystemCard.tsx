import React from 'react';

export interface SystemCardProps {
  payload: {
    kind: 'summary' | 'offer.proposed' | 'offer.accepted' | 'shipment.created' | 'qr.generated' | 'request.archived' | 'receive.full' | 'receive.partial' | 'file.processed' | 'file.processing.failed';
    entity?: 'request' | 'shipment';
    data: Record<string, unknown>;
  };
}

export function SystemCard({ payload }: SystemCardProps) {
  const { kind, entity, data } = payload;

  // Рендерим разные типы SystemCard
  switch (kind) {
    case 'summary':
      return <SummaryCard entity={entity!} data={data} />;
    case 'offer.proposed':
      return <OfferProposedCard data={data} />;
    case 'offer.accepted':
      return <OfferAcceptedCard />;
    case 'shipment.created':
      return <ShipmentCreatedCard data={data} />;
    case 'qr.generated':
      return <QRGeneratedCard data={data} />;
    case 'request.archived':
      return <RequestArchivedCard />;
    case 'receive.full':
      return <ReceiveCard mode="full" data={data} />;
    case 'receive.partial':
      return <ReceiveCard mode="partial" data={data} />;
    case 'file.processed':
      return <FileProcessedCard data={data} />;
    case 'file.processing.failed':
      return <FileProcessingFailedCard data={data} />;
    default:
      return null;
  }
}

// Summary Card (существующая логика)
function SummaryCard({ entity, data }: { entity: 'request' | 'shipment'; data: Record<string, unknown> }) {

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') {
      if (value % 1 === 0) return value.toString();
      return value.toFixed(2);
    }
    return String(value);
  };

  const getEntityTitle = () => {
    return entity === 'request' ? 'Заявка' : 'Отгрузка';
  };

  const getEntityIcon = () => {
    return entity === 'request' ? (
      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ) : (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    );
  };

  const renderDataFields = () => {
    const fields = Object.entries(data).filter(([, value]) => value !== null && value !== undefined);
    
    if (fields.length === 0) {
      return <p className="text-gray-500 text-sm">Нет дополнительных данных</p>;
    }

    return (
      <div className="space-y-2">
        {fields.map(([key, value]) => (
          <div key={key} className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-600 capitalize">
              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </span>
            <span className="text-sm text-gray-900 text-right max-w-xs break-words">
              {formatValue(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center space-x-2 mb-3">
        {getEntityIcon()}
        <h3 className="text-sm font-semibold text-gray-800">
          Резюме {getEntityTitle()}
        </h3>
      </div>
      {renderDataFields()}
    </div>
  );
}

// Offer Proposed Card
function OfferProposedCard({ data }: { data: Record<string, unknown> }) {
  const offerData = data as {
    pricePerKgUSD: number;
    insuranceUSD?: number;
    packingUSD?: number;
    deliveryDays?: number;
    deliveryMethod?: string;
    notes?: string;
  };
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center space-x-2 mb-3">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
        <h3 className="text-sm font-semibold text-blue-800">
          Предложение от администратора
        </h3>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-blue-700">Цена за кг:</span>
          <span className="text-sm font-medium text-blue-900">${offerData.pricePerKgUSD}</span>
        </div>
        {offerData.insuranceUSD && (
          <div className="flex justify-between">
            <span className="text-sm text-blue-700">Страховка:</span>
            <span className="text-sm font-medium text-blue-900">${offerData.insuranceUSD}</span>
          </div>
        )}
        {offerData.packingUSD && (
          <div className="flex justify-between">
            <span className="text-sm text-blue-700">Упаковка:</span>
            <span className="text-sm font-medium text-blue-900">${offerData.packingUSD}</span>
          </div>
        )}
        {offerData.deliveryDays && (
          <div className="flex justify-between">
            <span className="text-sm text-blue-700">Срок доставки:</span>
            <span className="text-sm font-medium text-blue-900">{offerData.deliveryDays} дней</span>
          </div>
        )}
        {offerData.deliveryMethod && (
          <div className="flex justify-between">
            <span className="text-sm text-blue-700">Способ:</span>
            <span className="text-sm font-medium text-blue-900">{offerData.deliveryMethod}</span>
          </div>
        )}
        {offerData.notes && (
          <div className="mt-2 p-2 bg-blue-100 rounded text-sm text-blue-800">
            {offerData.notes}
          </div>
        )}
      </div>
    </div>
  );
}

// Offer Accepted Card
function OfferAcceptedCard() {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="text-sm font-semibold text-green-800">
          Предложение принято
        </h3>
      </div>
    </div>
  );
}

// Shipment Created Card
function ShipmentCreatedCard({ data }: { data: Record<string, unknown> }) {
  const shipmentData = data as { status: string };
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h3 className="text-sm font-semibold text-emerald-800">
          Отгрузка создана
        </h3>
      </div>
      <p className="text-sm text-emerald-700 mt-1">
        Статус: {shipmentData.status}
      </p>
    </div>
  );
}

// QR Generated Card
function QRGeneratedCard({ data }: { data: Record<string, unknown> }) {
  const qrData = data as { code: string; pdfUrl?: string };
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center space-x-2 mb-3">
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
        <h3 className="text-sm font-semibold text-purple-800">
          QR этикетка сгенерирована
        </h3>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-purple-700">Код:</span>
          <span className="text-sm font-mono font-medium text-purple-900 bg-purple-100 px-2 py-1 rounded">
            {qrData.code}
          </span>
        </div>
        {qrData.pdfUrl && (
          <a 
            href={qrData.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 underline"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Скачать PDF
          </a>
        )}
      </div>
    </div>
  );
}

// Request Archived Card
function RequestArchivedCard() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293h9.172a1 1 0 00.707-.293l1.414-1.414A1 1 0 0018.414 4H19a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
        <h3 className="text-sm font-semibold text-gray-800">
          Запрос архивирован
        </h3>
      </div>
    </div>
  );
}

// Receive Card
function ReceiveCard({ mode, data }: { mode: 'full' | 'partial'; data: Record<string, unknown> }) {
  const receiveData = data as { notes?: string };
  const isFull = mode === 'full';
  const bgColor = isFull ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200';
  const textColor = isFull ? 'text-green-800' : 'text-yellow-800';
  const iconColor = isFull ? 'text-green-600' : 'text-yellow-600';
  const title = isFull ? 'Груз принят полностью' : 'Груз принят частично';

  return (
    <div className={`${bgColor} border rounded-lg p-4 shadow-sm`}>
      <div className="flex items-center space-x-2 mb-2">
        <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className={`text-sm font-semibold ${textColor}`}>
          {title}
        </h3>
      </div>
      {receiveData.notes && (
        <div className={`mt-2 p-2 ${isFull ? 'bg-green-100' : 'bg-yellow-100'} rounded text-sm ${textColor}`}>
          {receiveData.notes}
        </div>
      )}
    </div>
  );
}

// S7: File Processing Cards
function FileProcessedCard({ data }: { data: Record<string, unknown> }) {
  const processData = data as { 
    attachmentId: string; 
    success: boolean; 
    hasThumbnail?: boolean; 
    avClean?: boolean;
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-sm font-semibold text-blue-800">
          Файл обработан
        </h3>
      </div>
      <div className="mt-2 space-y-1">
        {processData.hasThumbnail && (
          <div className="flex items-center text-sm text-blue-700">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Превью сгенерировано
          </div>
        )}
        {processData.avClean !== undefined && (
          <div className="flex items-center text-sm text-blue-700">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {processData.avClean ? 'Файл безопасен' : 'Обнаружена угроза'}
          </div>
        )}
      </div>
    </div>
  );
}

function FileProcessingFailedCard({ data }: { data: Record<string, unknown> }) {
  const errorData = data as { 
    attachmentId: string; 
    error?: string;
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-sm font-semibold text-red-800">
          Ошибка обработки файла
        </h3>
      </div>
      {errorData.error && (
        <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-700">
          {errorData.error}
        </div>
      )}
    </div>
  );
}
