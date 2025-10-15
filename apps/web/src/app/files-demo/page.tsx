'use client';

import React, { useState, useEffect } from 'react';
import { AttachmentCard } from '@/components/files/AttachmentCard';
import { FileViewer } from '@/components/files/FileViewer';
import { AnnotationsPanel } from '@/components/files/AnnotationsPanel';
import { VersionsPanel } from '@/components/files/VersionsPanel';
import { FLAGS } from '@yp/shared';

interface Attachment {
  id: string;
  fileName: string;
  type: string;
  mime: string;
  bytes: number;
  width?: number;
  height?: number;
  pages?: number;
  thumbKey?: string;
  ocrTextKey?: string;
  isSafe: boolean;
  currentVerId?: string;
  uploadedAt: string;
  versions?: any[];
  annotations?: any[];
  meta?: {
    ocrDone: boolean;
    ocrLang?: string;
  };
}

export default function FilesDemoPage() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  useEffect(() => {
    loadAttachments();
  }, []);

  const loadAttachments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Загружаем вложения из чата (демо данные)
      const response = await fetch('/api/shipments');
      if (response.ok) {
        const data = await response.json();
        // Здесь должны быть реальные вложения из чатов
        // Для демо создаем тестовые данные
        setAttachments(createDemoAttachments());
      } else {
        setAttachments(createDemoAttachments());
      }
    } catch (error) {
      console.error('Error loading attachments:', error);
      setAttachments(createDemoAttachments());
    } finally {
      setIsLoading(false);
    }
  };

  const createDemoAttachments = (): Attachment[] => [
    {
      id: 'demo-1',
      fileName: 'invoice_2024.pdf',
      type: 'pdf',
      mime: 'application/pdf',
      bytes: 1024 * 1024 * 2.5, // 2.5 MB
      pages: 3,
      thumbKey: 'thumbs/demo-1.jpg',
      ocrTextKey: 'ocr/demo-1.txt',
      isSafe: true,
      uploadedAt: new Date().toISOString(),
      versions: [
        {
          id: 'v1',
          fileName: 'invoice_2024_v1.pdf',
          mime: 'application/pdf',
          bytes: 1024 * 1024 * 2.3,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          note: 'Первая версия'
        }
      ],
      annotations: [
        {
          id: 'a1',
          authorId: 'user1',
          page: 1,
          rect: { x: 100, y: 200, w: 200, h: 50 },
          content: 'Проверить сумму',
          createdAt: new Date().toISOString()
        }
      ],
      meta: {
        ocrDone: true,
        ocrLang: 'ru+en'
      }
    },
    {
      id: 'demo-2',
      fileName: 'photo_meeting.jpg',
      type: 'image',
      mime: 'image/jpeg',
      bytes: 1024 * 1024 * 1.8, // 1.8 MB
      width: 1920,
      height: 1080,
      thumbKey: 'thumbs/demo-2.jpg',
      isSafe: true,
      uploadedAt: new Date(Date.now() - 3600000).toISOString(),
      versions: [],
      annotations: [],
      meta: {
        ocrDone: false
      }
    },
    {
      id: 'demo-3',
      fileName: 'suspicious_file.exe',
      type: 'other',
      mime: 'application/x-executable',
      bytes: 1024 * 1024 * 5.2, // 5.2 MB
      isSafe: false,
      uploadedAt: new Date(Date.now() - 7200000).toISOString(),
      versions: [],
      annotations: [],
      meta: {
        ocrDone: false
      }
    }
  ];

  const handleOpenAttachment = (attachment: Attachment) => {
    setSelectedAttachment(attachment);
    setShowViewer(true);
  };

  const handleDownloadAttachment = async (attachment: Attachment) => {
    try {
      const response = await fetch(`/api/attachments/${attachment.id}/url`);
      if (response.ok) {
        const data = await response.json();
        
        // Скачиваем файл
        const fileResponse = await fetch(data.url);
        const blob = await fileResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Ошибка скачивания файла');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Ошибка скачивания файла');
    }
  };

  const handleAnnotateAttachment = (attachment: Attachment) => {
    setSelectedAttachment(attachment);
    setShowAnnotations(true);
  };

  const handleVersionsAttachment = (attachment: Attachment) => {
    setSelectedAttachment(attachment);
    setShowVersions(true);
  };

  if (!FLAGS.FILES_PREVIEW_ENABLED) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Files 2.0 отключен</h1>
          <p className="text-gray-600">Включите флаги FILES_* в constants.ts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Files 2.0 Demo</h1>
              <p className="text-gray-600">Превью, OCR, версии, аннотации</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Флаги: 
                {FLAGS.FILES_PREVIEW_ENABLED && ' Превью'}
                {FLAGS.FILES_OCR_ENABLED && ' OCR'}
                {FLAGS.FILES_ANNOTATIONS_ENABLED && ' Аннотации'}
                {FLAGS.FILES_VERSIONING_ENABLED && ' Версии'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Статистика */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Статистика</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{attachments.length}</div>
              <div className="text-sm text-gray-600">Всего файлов</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {attachments.filter(a => a.isSafe).length}
              </div>
              <div className="text-sm text-gray-600">Безопасных</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {attachments.filter(a => a.meta?.ocrDone).length}
              </div>
              <div className="text-sm text-gray-600">С OCR</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {attachments.reduce((sum, a) => sum + (a.annotations?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Аннотаций</div>
            </div>
          </div>
        </div>

        {/* Список файлов */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Файлы</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600">
              <div className="text-lg mb-2">⚠️</div>
              <div>{error}</div>
            </div>
          ) : attachments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-4">📁</div>
              <div>Файлов пока нет</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attachments.map((attachment) => (
                <AttachmentCard
                  key={attachment.id}
                  attachment={attachment}
                  onOpen={handleOpenAttachment}
                  onDownload={handleDownloadAttachment}
                  onAnnotate={handleAnnotateAttachment}
                  onVersions={handleVersionsAttachment}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Модалы */}
      {selectedAttachment && (
        <>
          <FileViewer
            attachment={selectedAttachment}
            isOpen={showViewer}
            onClose={() => setShowViewer(false)}
            onAnnotate={handleAnnotateAttachment}
          />
          
          <AnnotationsPanel
            attachment={selectedAttachment}
            isOpen={showAnnotations}
            onClose={() => setShowAnnotations(false)}
          />
          
          <VersionsPanel
            attachment={selectedAttachment}
            isOpen={showVersions}
            onClose={() => setShowVersions(false)}
          />
        </>
      )}
    </div>
  );
}


