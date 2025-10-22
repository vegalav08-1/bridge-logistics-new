'use client';

import React, { useState } from 'react';
import { getFeatureFlags } from '@/lib/flags';
import { MasterChatHeader } from './MasterChatHeader';
import { ChildChatsDrawer } from './ChildChatsDrawer';
import { QRAccessCard } from './QRAccessCard';
import { ConfiguratorDrawer } from './ConfiguratorDrawer';
import { Calculator, QrCode } from 'lucide-react';

interface ChatEnhancementsProps {
  chatId: string;
  isMaster?: boolean;
  masterTitle?: string;
  children?: Array<{
    chatId: string;
    number: string;
    status: string;
    lastMessageAt: string;
  }>;
  shipmentNumber?: string;
  clientCode?: string;
  pdfUrl?: string;
  pngUrl?: string;
  canManage?: boolean;
}

export function ChatEnhancements({
  chatId,
  isMaster = false,
  masterTitle,
  children = [],
  shipmentNumber,
  clientCode,
  pdfUrl,
  pngUrl,
  canManage = false
}: ChatEnhancementsProps) {
  const flags = getFeatureFlags();
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string>();

  const handleArrivedClick = async () => {
    if (!flags.CHAT_MERGE_SPLIT_V2) return;
    
    try {
      const response = await fetch('/api/chat/master/arrived', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterChatId: chatId })
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`ARRIVED статус распространён на ${data.updatedChildren} отгрузок`);
      }
    } catch (error) {
      console.error('Error cascading ARRIVED status:', error);
      alert('Ошибка при обновлении статуса');
    }
  };

  const handleChildSelect = (childChatId: string) => {
    setSelectedChildId(childChatId);
    // TODO: Navigate to child chat or show in modal
  };

  const handleRequestAccess = async () => {
    if (!flags.CHAT_QR_ACCESS_V2) return;
    
    try {
      const response = await fetch('/api/chat/qr/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chatId, 
          requesterId: 'user-1' // TODO: Get from auth context
        })
      });
      
      if (response.ok) {
        alert('Запрос на доступ отправлен администраторам');
      }
    } catch (error) {
      console.error('Error requesting access:', error);
      alert('Ошибка при отправке запроса');
    }
  };

  const handleConfiguratorPublish = async (data: any) => {
    if (!flags.CHAT_CONFIGURATOR_V1) return;
    
    try {
      const response = await fetch(`/api/chat/${chatId}/configurator/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        alert('Результат конфигуратора опубликован в чат');
      }
    } catch (error) {
      console.error('Error publishing configurator result:', error);
      alert('Ошибка при публикации результата');
    }
  };

  return (
    <>
      {/* Master chat header */}
      {isMaster && flags.CHAT_MERGE_SPLIT_V2 && (
        <MasterChatHeader
          title={masterTitle || 'Master Chat'}
          childrenCount={children.length}
          onArrivedClick={handleArrivedClick}
          canManage={canManage}
        />
      )}

      {/* QR Access Card */}
      {flags.CHAT_QR_ACCESS_V2 && shipmentNumber && clientCode && (
        <QRAccessCard
          shipmentNumber={shipmentNumber}
          clientCode={clientCode}
          pdfUrl={pdfUrl}
          pngUrl={pngUrl}
          onRequestAccess={handleRequestAccess}
          isForeignBranch={false} // TODO: Determine from context
        />
      )}

      {/* Child chats drawer */}
      {isMaster && flags.CHAT_MERGE_SPLIT_V2 && children.length > 0 && (
        <ChildChatsDrawer
          children={children}
          onChildSelect={handleChildSelect}
          selectedChatId={selectedChildId}
        />
      )}

      {/* Configurator drawer */}
      {flags.CHAT_CONFIGURATOR_V1 && (
        <ConfiguratorDrawer
          isOpen={showConfigurator}
          onClose={() => setShowConfigurator(false)}
          onPublish={handleConfiguratorPublish}
        />
      )}

      {/* Action buttons */}
      <div className="flex gap-2 p-4 border-t">
        {flags.CHAT_CONFIGURATOR_V1 && (
          <button
            onClick={() => setShowConfigurator(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            <Calculator className="h-4 w-4" />
            Конфигуратор
          </button>
        )}
        
        {flags.CHAT_QR_ACCESS_V2 && shipmentNumber && (
          <button
            onClick={() => {
              // TODO: Show QR code modal
              alert('QR код: ' + shipmentNumber);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <QrCode className="h-4 w-4" />
            Показать QR
          </button>
        )}
      </div>
    </>
  );
}
