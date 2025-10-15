/**
 * API calls for Chat UI3 - transition actions and operations
 */

import { StatusTransitionPayload } from './types';
import { generateRealShipmentData, generateInitialMessages, ShipmentInfo, ChatMessage } from './real-data';

/**
 * Post a status transition
 */
export async function postTransition(chatId: string, action: string, payload?: any): Promise<{ ok: boolean }> {
  try {
    const response = await fetch(`/api/shipments/${chatId}/transition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to perform transition');
    }

    return { ok: true };
  } catch (error) {
    console.error('Transition failed:', error);
    throw error;
  }
}

/**
 * Open packing configurator (navigate to S16 configurator)
 */
export async function openConfigurator(chatId: string): Promise<void> {
  // Navigate to packing configurator panel or route
  // This will be implemented when S16 is integrated
  console.log('Opening configurator for chat:', chatId);
  
  // For now, just show a placeholder
  alert('Packing configurator will be available in S16');
}

/**
 * Show QR code for shipment
 */
export async function showQRCode(chatId: string): Promise<{
  chatId: string;
  shipmentId: string;
  number: string;
  status: string;
  createdAt: string;
}> {
  // Получаем данные об отгрузке
  const shipmentData = {
    chatId,
    shipmentId: chatId,
    number: `BR-${chatId.slice(-6).toUpperCase()}`,
    status: 'NEW', // В реальном приложении получать из API
    createdAt: new Date().toISOString()
  };
  
  console.log('QR Code data for chat:', chatId, shipmentData);
  return shipmentData;
}

/**
 * Archive a request
 */
export async function archiveRequest(chatId: string, reason?: string): Promise<{ ok: boolean }> {
  return postTransition(chatId, 'archive_request', { reason });
}

/**
 * Create an offer for a request
 */
export async function createOffer(chatId: string, offerData: any): Promise<{ ok: boolean }> {
  return postTransition(chatId, 'create_offer', offerData);
}

/**
 * Receive shipment (full or partial)
 */
export async function receiveShipment(chatId: string, type: 'full' | 'partial', comment?: string): Promise<{ ok: boolean }> {
  return postTransition(chatId, `receive_${type}`, { comment });
}

/**
 * Start reconciliation process
 */
export async function startReconcile(chatId: string, reconcileData: any): Promise<{ ok: boolean }> {
  return postTransition(chatId, 'start_reconcile', reconcileData);
}

/**
 * Finish reconciliation
 */
export async function finishReconcile(chatId: string, reconcileData: any): Promise<{ ok: boolean }> {
  return postTransition(chatId, 'finish_reconcile', reconcileData);
}

/**
 * Merge shipments
 */
export async function mergeShipments(chatId: string, targetChatId: string): Promise<{ ok: boolean }> {
  return postTransition(chatId, 'attach_merge', { targetChatId });
}

/**
 * Detach from merge
 */
export async function detachMerge(chatId: string, reason?: string): Promise<{ ok: boolean }> {
  return postTransition(chatId, 'detach_merge', { reason });
}

/**
 * Finish merge process
 */
export async function finishMerge(chatId: string): Promise<{ ok: boolean }> {
  return postTransition(chatId, 'finish_merge');
}

/**
 * Arrive to destination city
 */
export async function arriveToCity(chatId: string, city: string, comment?: string): Promise<{ ok: boolean }> {
  return postTransition(chatId, 'arrive_to_city', { city, comment });
}

/**
 * Deliver shipment
 */
export async function deliverShipment(chatId: string, recipient: string, comment?: string): Promise<{ ok: boolean }> {
  return postTransition(chatId, 'deliver', { recipient, comment });
}

/**
 * Cancel shipment
 */
export async function cancelShipment(chatId: string, reason: string): Promise<{ ok: boolean }> {
  return postTransition(chatId, 'cancel_shipment', { reason });
}

export async function deleteShipment(chatId: string, reason: string, comment?: string): Promise<{ ok: boolean }> {
  try {
    const response = await fetch(`/api/shipments/${chatId}/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason, comment }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete shipment');
    }

    return { ok: true };
  } catch (error) {
    console.error('Error in deleteShipment:', error);
    throw error;
  }
}

/**
 * Get real shipment data
 */
export async function getShipmentData(chatId: string): Promise<ShipmentInfo> {
  // В реальном приложении здесь был бы API вызов
  // Для демонстрации генерируем данные
  return generateRealShipmentData(chatId);
}

/**
 * Get chat messages
 */
export async function getChatMessages(chatId: string): Promise<ChatMessage[]> {
  // В реальном приложении здесь был бы API вызов
  // Для демонстрации генерируем начальные сообщения
  const shipment = await getShipmentData(chatId);
  return generateInitialMessages(shipment);
}

/**
 * Send message to chat
 */
export async function sendMessage(chatId: string, content: string, type: 'user' | 'admin' = 'user'): Promise<ChatMessage> {
  // В реальном приложении здесь был бы API вызов
  // Для демонстрации создаем сообщение
  const message: ChatMessage = {
    id: `msg-${Date.now()}`,
    type,
    content,
    timestamp: new Date().toISOString(),
    sender: {
      name: type === 'user' ? 'Иван Петров' : 'Менеджер Bridge',
      role: type === 'user' ? 'USER' : 'ADMIN'
    },
    isPinned: false
  };
  
  console.log('Message sent:', message);
  return message;
}

/**
 * Log scanner action to chat
 */
export async function logScannerAction(
  chatId: string, 
  action: 'scan_found' | 'scan_not_found' | 'confirm_full' | 'confirm_partial',
  data: {
    scannedCode: string;
    shipmentId?: string;
    status?: string;
  }
): Promise<ChatMessage> {
  const now = new Date();
  const timestamp = now.toISOString();
  const timeStr = now.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  let content = '';
  
  switch (action) {
    case 'scan_found':
      content = `📱 Сканирование: Груз найден\nКод: ${data.scannedCode}\nОтгрузка: ${data.shipmentId}\nСтатус: ${data.status}\nВремя: ${timeStr}\nОтветственный: Администратор`;
      break;
    case 'scan_not_found':
      content = `📱 Сканирование: Груз не найден\nКод: ${data.scannedCode}\nВремя: ${timeStr}\nОтветственный: Администратор`;
      break;
    case 'confirm_full':
      content = `✅ Подтверждение: Полностью принято\nКод: ${data.scannedCode}\nОтгрузка: ${data.shipmentId}\nВремя: ${timeStr}\nОтветственный: Администратор`;
      break;
    case 'confirm_partial':
      content = `⚠️ Подтверждение: Частично принято\nКод: ${data.scannedCode}\nОтгрузка: ${data.shipmentId}\nВремя: ${timeStr}\nОтветственный: Администратор`;
      break;
  }

  const message: ChatMessage = {
    id: `scanner-${Date.now()}`,
    type: 'system',
    content,
    timestamp,
    sender: {
      name: 'Система сканирования',
      role: 'ADMIN'
    },
    isPinned: false
  };

  console.log('Scanner action logged:', message);
  return message;
}

