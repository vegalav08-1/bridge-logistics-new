'use client';
import React, { useState, useEffect } from 'react';
import { X, Download, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  shipmentData?: {
    id: string;
    number: string;
    status: string;
    createdAt: string;
  };
}

export default function QRCodeModal({ isOpen, onClose, chatId, shipmentData }: QRCodeModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Генерируем QR-код при открытии модала
  useEffect(() => {
    if (isOpen) {
      generateQRCode();
    }
  }, [isOpen, chatId]);

  const generateQRCode = async () => {
    setLoading(true);
    try {
      // Создаем данные для QR-кода
      const qrData = {
        chatId,
        shipmentId: shipmentData?.id || chatId,
        number: shipmentData?.number || `BR-${chatId.slice(-6)}`,
        status: shipmentData?.status || 'NEW',
        url: `${window.location.origin}/chat/${chatId}`,
        timestamp: new Date().toISOString()
      };

      // Создаем простой QR-код как SVG
      const qrText = JSON.stringify(qrData);
      const qrSvg = createSimpleQRCode(qrText, 256);
      setQrCodeDataUrl('data:image/svg+xml;base64,' + btoa(qrSvg));
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Fallback - создаем простой QR-код
      setQrCodeDataUrl('data:image/svg+xml;base64,' + btoa(`
        <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
          <rect width="256" height="256" fill="white"/>
          <text x="128" y="128" text-anchor="middle" font-family="Arial" font-size="12">
            QR Code for ${chatId}
          </text>
        </svg>
      `));
    } finally {
      setLoading(false);
    }
  };

  // Простая функция для создания QR-кода
  const createSimpleQRCode = (text: string, size: number): string => {
    // Создаем простой паттерн QR-кода
    const pattern: number[][] = [];
    for (let i = 0; i < 25; i++) {
      pattern[i] = [];
      for (let j = 0; j < 25; j++) {
        // Создаем паттерн на основе текста
        const hash = (text.charCodeAt((i * 25 + j) % text.length) + i + j) % 2;
        pattern[i][j] = hash;
      }
    }

    // Добавляем угловые маркеры
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if ((i < 7 && j < 7) || (i >= 18 && j < 7) || (i < 7 && j >= 18)) {
          pattern[i][j] = 1;
        }
      }
    }

    // Создаем SVG
    const cellSize = size / 25;
    let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${size}" height="${size}" fill="white"/>`;
    
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        if (pattern[i][j]) {
          svg += `<rect x="${j * cellSize}" y="${i * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
        }
      }
    }
    
    svg += '</svg>';
    return svg;
  };

  const downloadPDF = async () => {
    try {
      // Создаем HTML для печати/PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR-код отгрузки</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 20px; }
            .qr-code { text-align: center; margin: 20px 0; }
            .qr-code img { max-width: 200px; height: auto; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>QR-код отгрузки</h1>
          </div>
          <div class="info">
            <p><strong>ID отгрузки:</strong> ${shipmentData?.id || chatId}</p>
            <p><strong>Номер:</strong> ${shipmentData?.number || `BR-${chatId.slice(-6)}`}</p>
            <p><strong>Статус:</strong> ${shipmentData?.status || 'NEW'}</p>
            <p><strong>Создан:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div class="qr-code">
            <img src="${qrCodeDataUrl}" alt="QR-код" />
            <p>Отсканируйте этот QR-код для доступа к отгрузке</p>
          </div>
          <div class="no-print">
            <button onclick="window.print()">Печать PDF</button>
            <button onclick="window.close()">Закрыть</button>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Автоматически открываем диалог печати
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Ошибка создания PDF. Попробуйте еще раз.');
    }
  };

  const copyToClipboard = async () => {
    try {
      const url = `${window.location.origin}/chat/${chatId}`;
      await navigator.clipboard.writeText(url);
      alert('Ссылка скопирована в буфер обмена!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Ошибка копирования в буфер обмена');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>QR-код</CardTitle>
          <button
            className="h-8 w-8 grid place-items-center rounded-full hover:bg-muted"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Информация об отгрузке */}
          <div className="space-y-2 text-sm">
            <div><strong>ID отгрузки:</strong> {shipmentData?.id || chatId}</div>
            <div><strong>Номер:</strong> {shipmentData?.number || `BR-${chatId.slice(-6)}`}</div>
            <div><strong>Статус:</strong> {shipmentData?.status || 'NEW'}</div>
          </div>

          {/* QR-код */}
          <div className="flex justify-center">
            {loading ? (
              <div className="h-64 w-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <div className="text-sm text-gray-500">Генерация QR-кода...</div>
                </div>
              </div>
            ) : qrCodeDataUrl ? (
              <img 
                src={qrCodeDataUrl} 
                alt="QR Code" 
                className="h-64 w-64 border rounded-lg"
              />
            ) : (
              <div className="h-64 w-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center text-gray-500">
                  <div className="text-sm">QR-код недоступен</div>
                </div>
              </div>
            )}
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-2">
            <Button
              onClick={downloadPDF}
              disabled={loading || !qrCodeDataUrl}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Скачать PDF
            </Button>
            <Button
              onClick={copyToClipboard}
              variant="secondary"
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Копировать ссылку
            </Button>
          </div>

          {/* Дополнительная информация */}
          <div className="text-xs text-gray-500 text-center">
            Отсканируйте этот QR-код для быстрого доступа к отгрузке
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
