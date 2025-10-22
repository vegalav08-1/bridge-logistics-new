'use client';

import React, { useState } from 'react';
import { QrCode, Download, ExternalLink, AlertTriangle } from 'lucide-react';

interface QRAccessCardProps {
  shipmentNumber: string;
  clientCode: string;
  pdfUrl?: string;
  pngUrl?: string;
  onRequestAccess?: () => void;
  isForeignBranch?: boolean;
}

export function QRAccessCard({ 
  shipmentNumber, 
  clientCode, 
  pdfUrl, 
  pngUrl, 
  onRequestAccess,
  isForeignBranch = false
}: QRAccessCardProps) {
  const [showQR, setShowQR] = useState(false);

  if (isForeignBranch) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-yellow-800 mb-1">
              Доступ к чужой ветке
            </h3>
            <p className="text-sm text-yellow-700 mb-3">
              Эта отгрузка принадлежит администратору другой ветки. 
              Для доступа необходимо запросить назначение ответственным.
            </p>
            <div className="flex items-center gap-2 text-sm text-yellow-600 mb-3">
              <span>Отгрузка: {shipmentNumber}</span>
              <span>•</span>
              <span>Код клиента: {clientCode}</span>
            </div>
            {onRequestAccess && (
              <button
                onClick={onRequestAccess}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Запросить назначение ответственным
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium text-blue-800">QR-доступ к отгрузке</h3>
        </div>
        <button
          onClick={() => setShowQR(!showQR)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showQR ? 'Скрыть' : 'Показать QR'}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">Номер:</span>
          <span className="font-mono font-medium">{shipmentNumber}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">Код клиента:</span>
          <span className="font-mono font-medium">{clientCode}</span>
        </div>

        {showQR && (
          <div className="bg-white border border-blue-200 rounded-lg p-4">
            <div className="text-center">
              <div className="inline-block bg-white p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto" />
                <p className="text-xs text-gray-500 mt-2">QR-код для сканирования</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              PDF
            </a>
          )}
          {pngUrl && (
            <a
              href={pngUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              PNG
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
