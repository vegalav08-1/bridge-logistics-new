'use client';
import { useEffect, useRef, useState } from 'react';
import { ensureCamera, stopStream } from './camera';
import { decodeFrame } from './barcode';
import { resolveDeepLink } from '@/lib/search/route';
import { auditScan } from '@/lib/search/audit';
import { logScannerAction } from '@/lib/chat/api';
import { useRouter } from 'next/navigation';

export default function ScannerSheet({ open, onClose }:{ open:boolean; onClose:()=>void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream|null>(null);
  const [error, setError] = useState<string|undefined>(undefined);
  const [scanResult, setScanResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let raf=0; let stopped=false;
    const loop = async () => {
      if (stopped) return;
      const canvas = canvasRef.current, video = videoRef.current;
      if (canvas && video && video.readyState >= 2) {
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const res = await decodeFrame(canvas);
        if (res?.raw) {
          auditScan({ raw: res.raw, kind: res.kind });
          const deep = await resolveDeepLink(res.raw);
          if (deep) {
            setScanResult(deep);
            setShowResult(true);
            // Останавливаем камеру при успешном сканировании
            stopStream(stream!);
            setStream(null);
          }
          return;
        }
      }
      raf = requestAnimationFrame(loop);
    };

    (async()=>{
      if (!open) return;
      try {
        const s = await ensureCamera();
        setStream(s);
        if (videoRef.current) { videoRef.current.srcObject = s; await videoRef.current.play(); }
        raf = requestAnimationFrame(loop);
      } catch (e:any) { setError(e?.message ?? 'Ошибка камеры'); }
    })();

    return () => { stopped=true; cancelAnimationFrame(raf); stopStream(stream!); setStream(null); };
  }, [open]);

  if (!open) return null;

  // Функция для перехода к отгрузке
  const handleGoToShipment = async () => {
    if (scanResult?.link) {
      // Записываем действие в чат
      if (scanResult.found) {
        await logScannerAction(scanResult.id, 'scan_found', {
          scannedCode: scanResult.id,
          shipmentId: scanResult.id,
          status: scanResult.status
        });
      } else {
        await logScannerAction('not_found', 'scan_not_found', {
          scannedCode: scanResult.id
        });
      }
      
      router.push(scanResult.link);
      onClose();
    }
  };

  // Функция для подтверждения новой отгрузки
  const handleConfirmShipment = async (type: 'full' | 'partial') => {
    if (scanResult?.link) {
      // Записываем подтверждение в чат
      const action = type === 'full' ? 'confirm_full' : 'confirm_partial';
      await logScannerAction(scanResult.id, action, {
        scannedCode: scanResult.id,
        shipmentId: scanResult.id,
        status: scanResult.status
      });
      
      router.push(scanResult.link);
      onClose();
    }
  };

  // Функция для обработки ручного ввода
  const handleManualSearch = async () => {
    if (!manualInput.trim()) return;
    
    const deep = await resolveDeepLink(manualInput.trim());
    if (deep) {
      setScanResult(deep);
      setShowResult(true);
      setShowManualInput(false);
      setManualInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-3">
        {!showResult && !showManualInput ? (
          <>
            <div className="h-64 w-full bg-black rounded-xl overflow-hidden">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
            <div className="flex justify-between mt-2">
              <button 
                className="h-10 px-4 rounded-xl border" 
                onClick={() => setShowManualInput(true)}
              >
                Ввести вручную
              </button>
              <button className="h-10 px-4 rounded-xl border" onClick={onClose}>Закрыть</button>
            </div>
          </>
        ) : !showResult && showManualInput ? (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Введите номер груза</h3>
              <p className="text-sm text-gray-600 mb-4">
                Введите номер груза BR-, номер трекинга или номер запроса REQ-
              </p>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="BR-000001, LP123456, REQ-001..."
                className="w-full h-10 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
              />
              <div className="flex space-x-2">
                <button 
                  onClick={handleManualSearch}
                  className="flex-1 h-10 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  Найти
                </button>
                <button 
                  onClick={() => setShowManualInput(false)}
                  className="flex-1 h-10 px-4 rounded-xl border"
                >
                  Назад
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {scanResult.found ? 'Груз найден!' : 'Груз не найден'}
              </h3>
              {scanResult.found && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-800">
                    <strong>Номер:</strong> {scanResult.id}
                  </p>
                  <p className="text-sm text-green-800">
                    <strong>Статус:</strong> {scanResult.status}
                  </p>
                </div>
              )}
              {!scanResult.found && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-800">
                    Груз с номером "{scanResult.id}" не найден в системе
                  </p>
                </div>
              )}
            </div>
            
            {scanResult.found && scanResult.status === 'NEW' && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 text-center">
                  Новая отгрузка создана. Подтвердите получение:
                </p>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleConfirmShipment('full')}
                    className="flex-1 h-10 px-4 rounded-xl bg-green-600 text-white hover:bg-green-700"
                  >
                    Полностью принято
                  </button>
                  <button 
                    onClick={() => handleConfirmShipment('partial')}
                    className="flex-1 h-10 px-4 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700"
                  >
                    Частично принято
                  </button>
                </div>
              </div>
            )}
            
            {scanResult.found && scanResult.status !== 'NEW' && (
              <button 
                onClick={handleGoToShipment}
                className="w-full h-10 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                Перейти к отгрузке
              </button>
            )}
            
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  setShowResult(false);
                  setScanResult(null);
                  setShowManualInput(false);
                }}
                className="flex-1 h-10 px-4 rounded-xl border"
              >
                Сканировать еще
              </button>
              <button 
                onClick={onClose}
                className="flex-1 h-10 px-4 rounded-xl border"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

