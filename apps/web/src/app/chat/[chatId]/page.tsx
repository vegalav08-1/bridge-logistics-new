'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CHAT_HEADER_V2_ENABLED, STATUS_ACTIONS_V2_ENABLED, CHAT_LIST_V2_ENABLED, COMPOSER_V2_ENABLED, REALTIME_V2_ENABLED, FSM_V2_ENABLED, LINEAGE_V2_ENABLED, FINANCE_V2_ENABLED, PACKING_V2_ENABLED, ORDER_FSM_V1_ENABLED, ORDER_RACI_V1_ENABLED, ORDER_SLA_V1_ENABLED, CRV_V1_ENABLED, CRV_UI_V1_ENABLED, WMS_V1_ENABLED, CRM_V1_ENABLED, CHAT_V2_ENABLED, CHAT_V2_SETTINGS_ENABLED, CHAT_V2_MENTIONS_ENABLED, CHAT_V2_PARTICIPANTS_ENABLED, REAL_CHAT_ENABLED } from '@/lib/flags';
import { useRealtime } from '@/lib/realtime/context';
import { attachChatRealtime } from '@/lib/chat/rt-bridge';
import { ChatHeader as ChatHeaderV2 } from './components/ChatHeader';
import { ChatHeaderSkeleton } from './components/ChatHeader.skeleton';
import { ChatHeaderVM, Role } from '@/lib/chat/types';
import MessageList from './components/MessageList';
import RealMessageList from './components/RealMessageList';
import Composer from './components/Composer';
import { StatusActionsV2 } from '@/components/fsm/StatusActionsV2';
import { useFSM } from '@/lib/fsm/useFSM';
import { useOrder } from '@/lib/order/hooks/useOrder';
import OrderStatusActions from './components/OrderStatusActions';
import CreateCRDialog from './components/CRV/CreateCRDialog';
import ApproveCRDialog from './components/CRV/ApproveCRDialog';
import RollbackDialog from './components/CRV/RollbackDialog';
import ReceivingTab from './components/right-panel/WMS/ReceivingTab';
import ReconcileTab from './components/right-panel/WMS/ReconcileTab';
import QATab from './components/right-panel/WMS/QATab';
import PutawayTab from './components/right-panel/WMS/PutawayTab';
import ReturnsTab from './components/right-panel/WMS/ReturnsTab';
import LineagePanel from '@/components/lineage/LineagePanel';
import LineageBadge from '@/components/lineage/LineageBadge';
import FinancePanel from './components/FinancePanel';
import PackingPanel from './components/PackingPanel';
import { PinnedShipmentInfo } from './components/PinnedShipmentInfo';
import { saveShipmentStatus, loadShipmentStatus } from '@/lib/chat/status-persistence';

// Chat V2 imports
import * as chat2 from '@/lib/chat2/api';
import { useChat2Store } from '@/lib/chat2/store';
import { canEditSettings, canManageParticipants, canPin } from '@/lib/chat2/acl';
import ChatSettingsDrawer from './components/v2/ChatSettingsDrawer';
import ParticipantsDrawer from './components/v2/ParticipantsDrawer';
import MessageBubbleV2 from './components/v2/MessageBubbleV2';
import SystemCardV2 from './components/v2/SystemCardV2';
import {
  ConfirmDialog,
  ReceiveDialog,
  ReconcileDialog,
  PackConfiguratorEntry,
  MergeDialog,
  ArriveDialog,
  DeliverDialog,
  CancelDialog,
  DeleteDialog
} from './components/ActionModals';
import {
  postTransition,
  openConfigurator,
  showQRCode,
  getShipmentData,
  archiveRequest,
  createOffer,
  receiveShipment,
  startReconcile,
  finishReconcile,
  mergeShipments,
  detachMerge,
  finishMerge,
  arriveToCity,
  deliverShipment,
  cancelShipment,
  deleteShipment
} from '@/lib/chat/api';
import QRCodeModal from './components/QRCodeModal';

export default function ChatPage({ params }: { params: { chatId: string } }) {
  const router = useRouter();
  const chatId = params.chatId;
  const { send } = useRealtime();

  // Получаем статус заказа для проверки этапа NEW
  const order = useOrder ? useOrder(chatId) : null;
  const isNewStage = order?.order?.status === 'NEW';

  // UI3 State
  const [chatHeaderData, setChatHeaderData] = useState<ChatHeaderVM>({
    chatId: chatId,
    number: `BR-${chatId.slice(-6)}`,
    title: 'Test Chat V2',
    subtitle: 'Mock shipment chat with Chat V2',
    status: 'NEW',
    updatedAtISO: new Date().toISOString(),
    unreadCount: 0,
    adminName: 'Admin',
    userName: 'User',
    qrAvailable: true
  });
  const [userRole, setUserRole] = useState<Role>('ADMIN');
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Lineage state
  const [lineageOpen, setLineageOpen] = useState(false);

  // FSM state
  const fsm = useFSM(chatId, chatHeaderData?.status || 'NEW');
  
  // Chat V2 store
  const chat2Store = CHAT_V2_ENABLED ? useChat2Store() : null;
  
  // Проверка гидратации
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Debug: проверяем состояние chat2Store (только на клиенте)
  useEffect(() => {
    if (mounted) {
      console.log('Chat V2 store state:', {
        CHAT_V2_ENABLED,
        chat2Store: chat2Store ? 'loaded' : 'null',
        chats: chat2Store?.chats,
        messages: chat2Store?.messages
      });
    }
  }, [mounted, chat2Store]);

  // CR/V state
  const [crvModal, setCrvModal] = useState<string | null>(null);
  const [crvData, setCrvData] = useState<any>(null);

  // WMS state
  const [wmsPanelOpen, setWmsPanelOpen] = useState(false);
  const [activeWmsTab, setActiveWmsTab] = useState<'receiving' | 'reconcile' | 'qa' | 'putaway' | 'returns'>('receiving');

  // Chat V2 state
  const [openSettings, setOpenSettings] = useState(false);
  const [openParticipants, setOpenParticipants] = useState(false);
  
  // Real chat state
  const [realMessages, setRealMessages] = useState<any[]>([]);
  
  // Загрузка сообщений из localStorage при монтировании
  useEffect(() => {
    const loadStoredMessages = async () => {
      try {
        const { loadChatMessages } = await import('@/lib/chat/persistence');
        const storedMessages = loadChatMessages(chatId);
        if (storedMessages.length > 0) {
          console.log('Page: loaded stored messages:', storedMessages);
          setRealMessages(storedMessages);
        }
      } catch (error) {
        console.error('Failed to load stored messages:', error);
      }
    };
    
    loadStoredMessages();
  }, [chatId]);
  
  // Обработчик отправки сообщений для RealMessageList
  const handleRealSendMessage = async (content: string, attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }>) => {
    console.log('handleRealSendMessage called with:', content, attachments);
    console.log('Chat V2 enabled:', CHAT_V2_ENABLED, 'Store available:', !!chat2Store);
    
    // Если включен Chat V2, отправляем сообщение в Chat V2
    if (CHAT_V2_ENABLED && chat2Store) {
      try {
        console.log('Attempting to send message via Chat V2...');
        const message = await chat2.postMessage({
          chatId,
          kind: 'text',
          text: content,
          authorId: 'user-1'
        });
        console.log('Chat V2 message created:', message);
        chat2Store.prependMessage(chatId, message);
        console.log('Message added to Chat V2 store');
        return;
      } catch (error) {
        console.error('Failed to send message to Chat V2:', error);
        console.log('Falling back to Real Chat...');
      }
    }
    
    // Fallback для Real Chat
    console.log('Using Real Chat fallback...');
    const newMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: content || '',
      timestamp: new Date().toISOString(),
      sender: {
        name: 'Вы',
        role: 'USER'
      },
      isPinned: false,
      attachments: attachments || []
    };
    
    setRealMessages(prev => {
      // Проверяем, что сообщение еще не добавлено
      const exists = prev.some(m => m.id === newMessage.id);
      if (exists) return prev;
      
      const updatedMessages = [...prev, newMessage];
      
      // Сохраняем в localStorage
      import('@/lib/chat/persistence').then(({ saveChatMessages }) => {
        saveChatMessages(chatId, updatedMessages);
      });
      
      console.log('Message added to real messages:', newMessage);
      return updatedMessages;
    });
  };

  const [loading, setLoading] = useState(false); // Начинаем с false для Chat V2
  const [error, setError] = useState<string | null>(null);

  // UI3 Handlers
  const handleAction = async (actionKey: string) => {
    setActionLoading(true);
    try {
      switch (actionKey) {
        case 'receive_full':
        case 'receive_partial':
          setActiveModal('receive');
          setModalData({ type: actionKey.replace('receive_', '') });
          break;
        case 'start_reconcile':
          setActiveModal('reconcile');
          break;
        case 'finish_reconcile':
          setActiveModal('confirm');
          setModalData({
            title: 'Finish Reconciliation',
            description: 'Are you sure you want to finish the reconciliation process?',
            action: 'finish_reconcile'
          });
          break;
        case 'open_packing':
          setActiveModal('pack-config');
          break;
        case 'attach_merge':
          setActiveModal('merge');
          break;
        case 'detach_merge':
          setActiveModal('confirm');
          setModalData({
            title: 'Detach from Merge',
            description: 'Are you sure you want to detach this shipment from the merge?',
            action: 'detach_merge'
          });
          break;
        case 'finish_merge':
          setActiveModal('confirm');
          setModalData({
            title: 'Finish Merge',
            description: 'Are you sure you want to finish the merge process?',
            action: 'finish_merge'
          });
          break;
        case 'arrive_to_city':
          setActiveModal('arrive');
          break;
        case 'deliver':
          setActiveModal('deliver');
          break;
        case 'cancel_shipment':
          setActiveModal('cancel');
          break;
        case 'delete_shipment':
          setIsDeleteDialogOpen(true);
          break;
        case 'show_qr':
          const qrData = await showQRCode(chatId);
          setQrData(qrData);
          setQrModalOpen(true);
          break;
        case 'archive_request':
          setActiveModal('confirm');
          setModalData({
            title: 'Archive Request',
            description: 'Are you sure you want to archive this request?',
            action: 'archive_request'
          });
          break;
        case 'create_offer':
          await createOffer(chatId, {});
          break;
        case 'confirm_reconcile':
          setActiveModal('confirm');
          setModalData({
            title: 'Confirm Inspection',
            description: 'Are you sure you want to confirm the inspection?',
            action: 'confirm_reconcile'
          });
          break;
        case 'confirm_pickup':
          setActiveModal('confirm');
          setModalData({
            title: 'Confirm Receipt',
            description: 'Are you sure you want to confirm receipt of the shipment?',
            action: 'confirm_pickup'
          });
          break;
        default:
          console.warn('Unknown action:', actionKey);
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleModalConfirm = async (data: any) => {
    setActionLoading(true);
    try {
      switch (activeModal) {
        case 'receive':
          // Записываем сообщение в чат о получении
          const receiveMessage = data.type === 'full' 
            ? 'Получение: Полностью принято' 
            : 'Получение: Частично принято';
          
          if (data.comment) {
            handleRealSendMessage(receiveMessage + ` (${data.comment})`);
          } else {
            handleRealSendMessage(receiveMessage);
          }
          
          // Записываем сообщение о переходе к сверке
          handleRealSendMessage('Переход к этапу сверки');
          break;
        case 'reconcile':
          await startReconcile(chatId, data);
          break;
        case 'pack-config':
          await openConfigurator(chatId);
          break;
        case 'merge':
          await mergeShipments(chatId, data.targetChatId);
          break;
        case 'arrive':
          await arriveToCity(chatId, data.city, data.comment);
          break;
        case 'deliver':
          await deliverShipment(chatId, data.recipient, data.comment);
          break;
        case 'cancel':
          await cancelShipment(chatId, data.reason);
          break;
        case 'delete_shipment':
          await deleteShipment(chatId, data.reason, data.comment);
          break;
        case 'confirm':
          if (modalData?.action) {
            await postTransition(chatId, modalData.action, data);
          }
          break;
      }

      // Refresh chat data after successful action
      await fetchChat();
      setActiveModal(null);
      setModalData(null);
    } catch (error) {
      console.error('Modal action failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleModalClose = () => {
    setActiveModal(null);
    setModalData(null);
  };

  // Chat V2 handlers
  const handleSendMessage = async (payload: { text: string; mentions: Array<{id: string; name: string}> }) => {
    if (CHAT_V2_ENABLED) {
      try {
        const message = await chat2.postMessage({
          chatId,
          kind: 'text',
          text: payload.text,
          mentions: payload.mentions.map(m => ({ userId: m.id, from: 0, to: 0 })),
          authorId: 'current-user-id' // TODO: get from auth context
        } as any);
        if (chat2Store) {
          chat2Store.prependMessage(chatId, message);
        }
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const handleSaveSettings = async (settings: any) => {
    if (CHAT_V2_ENABLED) {
      try {
        await chat2.setChatSettings(chatId, settings);
        const c = await chat2.fetchChat(chatId);
        // Chat V2 chat handling will be done through the hook
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }
  };

  const handleInviteParticipant = async (userId: string, role: any) => {
    if (CHAT_V2_ENABLED) {
      try {
        await chat2.addParticipant(chatId, userId, role);
        const c = await chat2.fetchChat(chatId);
        // Chat V2 chat handling will be done through the hook
      } catch (error) {
        console.error('Failed to invite participant:', error);
      }
    }
  };

  const handleToggleMute = async (userId: string, muted: boolean) => {
    if (CHAT_V2_ENABLED) {
      try {
        await chat2.setParticipantMute(chatId, userId, muted);
        const c = await chat2.fetchChat(chatId);
        // Chat V2 chat handling will be done through the hook
      } catch (error) {
        console.error('Failed to toggle mute:', error);
      }
    }
  };

  useEffect(() => {
    fetchChat();
  }, [chatId]);

  // Real-time интеграция
  useEffect(() => {
    if (REALTIME_V2_ENABLED) {
      // Подписка на чат
      send({ type: 'subscribe', data: { topic: 'chat', id: chatId } });
      // Подключение моста для чата
      const detach = attachChatRealtime();
      return () => {
        send({ type: 'unsubscribe', data: { topic: 'chat', id: chatId } });
        detach();
      };
    }
  }, [chatId, send]);

  // Lineage интеграция
  useEffect(() => {
    const handleOpenLineage = () => setLineageOpen(true);
    window.addEventListener('open-lineage', handleOpenLineage);
    return () => window.removeEventListener('open-lineage', handleOpenLineage);
  }, []);

  // Chat V2 интеграция
  useEffect(() => {
    if (CHAT_V2_ENABLED && chat2Store) {
      (async () => {
        try {
          console.log('Initializing Chat V2 for chatId:', chatId);
          console.log('Chat V2 store before init:', chat2Store);
          
          const c = await chat2.fetchChat(chatId);
          console.log('Chat V2 chat data:', c);
          chat2Store.setChat(c);
          
          const page1 = await chat2.listMessages(chatId);
          console.log('Chat V2 messages:', page1.items);
          console.log('Messages count:', page1.items.length);
          chat2Store.setMessages(chatId, page1.items);
          
          console.log('Chat V2 store after init:', chat2Store);
          console.log('Messages in store:', chat2Store.messages[chatId]);
        } catch (error) {
          console.error('Chat V2 initialization failed:', error);
        }
      })();
    } else {
      console.log('Chat V2 not enabled or store not available:', {
        CHAT_V2_ENABLED,
        chat2Store: !!chat2Store
      });
    }
  }, [chatId, chat2Store]);

  const fetchChat = async () => {
    setLoading(true);
    try {
      console.log('Fetching chat data for:', chatId);
      console.log('CHAT_V2_ENABLED:', CHAT_V2_ENABLED);
      console.log('REAL_CHAT_ENABLED:', REAL_CHAT_ENABLED);
      
      // Mock data for testing
      let headerData: ChatHeaderVM;
      
      if (REAL_CHAT_ENABLED) {
        // Загружаем реальные данные отгрузки
        const { getShipmentData } = await import('@/lib/chat/api');
        const shipment = await getShipmentData(chatId);
        
        // Проверяем сохраненный статус
        const savedStatus = loadShipmentStatus(chatId);
        const currentStatus = savedStatus?.status || shipment.status;
        
        headerData = {
          chatId: chatId,
          number: shipment.number,
          title: shipment.title,
          subtitle: shipment.subtitle,
          status: currentStatus, // Используем сохраненный статус
          updatedAtISO: savedStatus?.updatedAt || shipment.updatedAt,
          unreadCount: 0,
          adminName: 'Менеджер Bridge',
          userName: shipment.client.name,
          qrAvailable: true
        };
      } else {
        // Загружаем моковые данные
        headerData = {
          chatId: chatId,
          number: `BR-${chatId.slice(-6)}`,
          title: 'Test Chat',
          subtitle: 'Mock shipment chat',
          status: 'NEW',
          updatedAtISO: new Date().toISOString(),
          unreadCount: 0,
          adminName: 'Admin',
          userName: 'User',
          qrAvailable: true
        };
      }
      
      console.log('Header data set:', headerData);
      setChatHeaderData(headerData);
      setUserRole('ADMIN');
    } catch (err: any) {
      console.error('Error fetching chat:', err);
      setError(err.message || 'Failed to fetch chat');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/shipments');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка чата...</p>
          <p className="text-sm text-gray-500 mt-2">Chat V2: {CHAT_V2_ENABLED ? 'включен' : 'выключен'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100svh]">
      {/* Header - Fixed at top with minimal height */}
      <div className="sticky top-0 z-50 bg-surface border-b border-border">
        {CHAT_HEADER_V2_ENABLED && chatHeaderData ? (
          <ChatHeaderV2
            data={chatHeaderData}
            role={userRole}
            onBack={handleBack}
            onOpenQR={async () => {
              const qrData = await showQRCode(chatId);
              setQrData(qrData);
              setQrModalOpen(true);
            }}
            onOpenSearch={() => console.log('open search')}
            onOpenInfo={() => console.log('open info')}
            onAction={handleAction}
            disabledActions={[]}
            onAcceptFull={async () => {
              try {
                // Используем правильный переход согласно FSM
                await postTransition(chatId, 'RECEIVE_ACCEPT', { 
                  type: 'full',
                  comment: 'Полностью принято'
                });
                
                // Добавляем сообщение в чат о принятии
                const acceptMessage = {
                  id: `accept-${Date.now()}`,
                  type: 'system' as const,
                  content: '✅ Груз полностью принят администратором',
                  timestamp: new Date().toISOString(),
                  sender: {
                    name: 'Система',
                    role: 'ADMIN' as const
                  },
                  isPinned: false
                };
                
                // Отправляем сообщение в чат
                if (handleRealSendMessage) {
                  await handleRealSendMessage(acceptMessage.content, []);
                }
                
                // Сохраняем статус в localStorage
                saveShipmentStatus(chatId, 'RECEIVE', { action: 'RECEIVE_ACCEPT', payload: { type: 'full', comment: 'Полностью принято' } });
                
                // Обновляем статус в данных чата
                const updatedData: ChatHeaderVM = {
                  ...chatHeaderData!,
                  status: 'RECEIVE', // Переходим на этап "Сверка"
                  updatedAtISO: new Date().toISOString()
                };
                setChatHeaderData(updatedData);
                
                console.log('Груз полностью принят, переход на этап "Сверка"');
              } catch (error) {
                console.error('Ошибка при полном принятии:', error);
              }
            }}
            onAcceptPartial={async () => {
              try {
                // Используем правильный переход согласно FSM
                await postTransition(chatId, 'RECEIVE_ACCEPT', { 
                  type: 'partial',
                  comment: 'Частично принято'
                });
                
                // Добавляем сообщение в чат о принятии
                const acceptMessage = {
                  id: `accept-${Date.now()}`,
                  type: 'system' as const,
                  content: '⚠️ Груз частично принят администратором',
                  timestamp: new Date().toISOString(),
                  sender: {
                    name: 'Система',
                    role: 'ADMIN' as const
                  },
                  isPinned: false
                };
                
                // Отправляем сообщение в чат
                if (handleRealSendMessage) {
                  await handleRealSendMessage(acceptMessage.content, []);
                }
                
                // Сохраняем статус в localStorage
                saveShipmentStatus(chatId, 'RECEIVE', { action: 'RECEIVE_ACCEPT', payload: { type: 'partial', comment: 'Частично принято' } });
                
                // Обновляем статус в данных чата
                const updatedData: ChatHeaderVM = {
                  ...chatHeaderData!,
                  status: 'RECEIVE', // Переходим на этап "Сверка"
                  updatedAtISO: new Date().toISOString()
                };
                setChatHeaderData(updatedData);
                
                console.log('Груз частично принят, переход на этап "Сверка"');
              } catch (error) {
                console.error('Ошибка при частичном принятии:', error);
              }
            }}
          />
        ) : (
          <div className="p-2 border-b">
            <button onClick={handleBack} className="text-blue-600">← Back</button>
            <h1 className="text-xl font-bold">Chat {chatId}</h1>
          </div>
        )}
      </div>

      {/* Order Lifecycle Pro Components */}
      {ORDER_FSM_V1_ENABLED && (
        <div className="px-4 py-2 space-y-2">
          {ORDER_RACI_V1_ENABLED && ORDER_SLA_V1_ENABLED && (
            <OrderStatusActions orderId={chatId} actorRole={userRole} />
          )}
        </div>
      )}

      {/* CR/V Components */}
      {CRV_V1_ENABLED && CRV_UI_V1_ENABLED && !isNewStage && (
        <div className="px-4 py-2 space-y-2">
          <div className="flex gap-2">
            <button 
              className="h-10 px-3 rounded-xl border"
              onClick={() => setCrvModal('create')}
            >
              Запросить изменение
            </button>
            <button 
              className="h-10 px-3 rounded-xl border"
              onClick={() => setCrvModal('rollback')}
            >
              Откат к версии
            </button>
          </div>
        </div>
      )}

      {/* WMS Components */}
      {WMS_V1_ENABLED && !isNewStage && (
        <div className="px-4 py-2 space-y-2">
          <div className="flex gap-2">
            <button 
              className="h-10 px-3 rounded-xl border"
              onClick={() => setWmsPanelOpen(true)}
            >
              Открыть WMS
            </button>
          </div>
        </div>
      )}

      {/* CRM Components */}
      {CRM_V1_ENABLED && !isNewStage && (
        <div className="px-4 py-2 space-y-2">
          <div className="flex gap-2">
            <button 
              className="h-10 px-3 rounded-xl border"
              onClick={() => router.push(`/crm/user/${chatId}`)}
            >
              Открыть CRM
            </button>
          </div>
        </div>
      )}


      {/* Message List - Scrollable area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Pinned Shipment Info - Always visible at top */}
        <PinnedShipmentInfo chatId={chatId} />
        
        {CHAT_V2_ENABLED ? (
          <div className="p-4 space-y-2">
            {/* Chat V2 messages will be rendered through the hook */}
            {mounted ? (() => {
              if (chat2Store?.messages?.[chatId]?.length > 0) {
                return chat2Store.messages[chatId].map((message: any) => (
                  <MessageBubbleV2 
                    key={message.id} 
                    message={message} 
                    isOwn={message.authorId === 'user-1'}
                    canPin={canPin('USER')}
                    onPin={(messageId: string, pinned: boolean) => {
                      // TODO: implement pin functionality
                      console.log('Pin message', messageId, pinned);
                    }}
                  />
                ));
              } else if (realMessages && realMessages.length > 0) {
                // Fallback: показываем Real Chat сообщения если Chat V2 не работает
                return realMessages.map((message: any) => (
                  <div key={message.id} className="p-3 bg-white rounded-lg border">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                        {message.sender?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{message.sender?.name || 'Unknown'}</span>
                          <span className="text-xs text-gray-500">{message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : 'Now'}</span>
                        </div>
                        <p className="text-sm mt-1">{message.content || 'No content'}</p>
                      </div>
                    </div>
                  </div>
                ));
              } else {
                return (
                  <div className="text-center text-gray-500 py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Загрузка сообщений Chat V2...</p>
                    <p className="text-sm mt-2">Store: {chat2Store ? 'loaded' : 'null'}</p>
                    <p className="text-sm">Messages: {chat2Store?.messages?.[chatId]?.length || 0}</p>
                    <p className="text-sm">Real Messages: {realMessages.length}</p>
                    <button 
                      onClick={() => {
                        console.log('Manual Chat V2 init...');
                        (async () => {
                          try {
                            const c = await chat2.fetchChat(chatId);
                            chat2Store?.setChat(c);
                            const page1 = await chat2.listMessages(chatId);
                            chat2Store?.setMessages(chatId, page1.items);
                            console.log('Manual init completed');
                          } catch (error) {
                            console.error('Manual init failed:', error);
                          }
                        })();
                      }}
                      className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs"
                    >
                      Принудительная инициализация
                    </button>
                  </div>
                );
              }
            })() : (
              // Fallback во время гидратации
              <div className="text-center text-gray-500 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Загрузка...</p>
              </div>
            )}
          </div>
        ) : REAL_CHAT_ENABLED ? (
          <RealMessageList
            chatId={chatId}
            messages={realMessages}
            onSendMessage={handleRealSendMessage}
          />
        ) : CHAT_LIST_V2_ENABLED ? (
          <MessageList
            chatId={chatId}
            onOpenAttachment={(id) => console.log('open viewer', id)}
            onDownloadAttachment={(id) => console.log('download', id)}
            onOpenOffer={(payload) => console.log('open offer', payload)}
            onOpenQR={(payload) => console.log('open qr', payload)}
          />
        ) : (
          <div className="p-4 text-sm text-gray-500">Legacy chat list</div>
        )}
      </div>


      {/* WMS Right Panel */}
      {WMS_V1_ENABLED && wmsPanelOpen && !isNewStage && (
        <div className="w-80 border-l bg-white flex flex-col">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">WMS</h3>
              <button 
                className="h-8 w-8 rounded-lg border grid place-items-center"
                onClick={() => setWmsPanelOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="flex gap-1 mt-2">
              {(['receiving', 'reconcile', 'qa', 'putaway', 'returns'] as const).map(tab => (
                <button
                  key={tab}
                  className={`h-8 px-2 rounded-lg text-xs ${activeWmsTab === tab ? 'bg-[var(--brand)] text-white' : 'border'}`}
                  onClick={() => setActiveWmsTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 p-3 overflow-y-auto">
            {activeWmsTab === 'receiving' && <ReceivingTab orderId={chatId} actorId="user-123" />}
            {activeWmsTab === 'reconcile' && <ReconcileTab orderId={chatId} />}
            {activeWmsTab === 'qa' && <QATab orderId={chatId} />}
            {activeWmsTab === 'putaway' && <PutawayTab orderId={chatId} actorId="user-123" />}
            {activeWmsTab === 'returns' && <ReturnsTab orderId={chatId} />}
          </div>
        </div>
      )}

      {/* Finance Panel */}
      {FINANCE_V2_ENABLED && !isNewStage && (
        <div className="p-4 border-t bg-white">
          <FinancePanel chatId={chatId} />
        </div>
      )}

      {/* Packing Panel */}
      {PACKING_V2_ENABLED && !isNewStage && (
        <div className="p-4 border-t bg-white">
          <PackingPanel shipmentId={chatId} />
        </div>
      )}

      {/* FSM Status Actions */}
      {FSM_V2_ENABLED && chatHeaderData && !isNewStage && (
        <div className="p-4 border-t bg-white">
          <StatusActionsV2
            chatId={chatId}
            role={userRole}
            status={chatHeaderData.status}
            onAction={handleAction}
            disabledKeys={actionLoading ? ['all'] : []}
          />
        </div>
      )}

    {/* Composer - Fixed at bottom */}
    {mounted && (
      <>
        {COMPOSER_V2_ENABLED ? (
          <div className="sticky bottom-0 z-40 bg-surface border-t border-border">
            <Composer chatId={chatId} onSendMessage={handleRealSendMessage} />
          </div>
        ) : (
          <div className="sticky bottom-0 z-40 bg-surface border-t border-border p-4">
            <div className="text-sm text-gray-500">Legacy composer</div>
          </div>
        )}
      </>
    )}

      {/* Action Modals */}
      {CHAT_HEADER_V2_ENABLED && STATUS_ACTIONS_V2_ENABLED && (
        <>
          <ConfirmDialog
            isOpen={activeModal === 'confirm'}
            onClose={handleModalClose}
            onConfirm={() => handleModalConfirm(modalData)}
            title={modalData?.title || 'Confirm'}
            description={modalData?.description}
            loading={actionLoading}
          />
          <ReceiveDialog
            isOpen={activeModal === 'receive'}
            onClose={handleModalClose}
            onConfirm={(type, comment) => handleModalConfirm({ type, comment })}
            loading={actionLoading}
          />
          <ReconcileDialog
            isOpen={activeModal === 'reconcile'}
            onClose={handleModalClose}
            onConfirm={() => handleModalConfirm(modalData)}
            loading={actionLoading}
          />
          <PackConfiguratorEntry
            isOpen={activeModal === 'pack-config'}
            onClose={handleModalClose}
            onOpenConfigurator={() => openConfigurator(chatId)}
            chatId={chatId}
          />
          <MergeDialog
            isOpen={activeModal === 'merge'}
            onClose={handleModalClose}
            onConfirm={() => handleModalConfirm(modalData)}
            loading={actionLoading}
          />
          <ArriveDialog
            isOpen={activeModal === 'arrive'}
            onClose={handleModalClose}
            onConfirm={() => handleModalConfirm(modalData)}
            loading={actionLoading}
          />
          <DeliverDialog
            isOpen={activeModal === 'deliver'}
            onClose={handleModalClose}
            onConfirm={() => handleModalConfirm(modalData)}
            loading={actionLoading}
          />
          <CancelDialog
            isOpen={activeModal === 'cancel'}
            onClose={handleModalClose}
            onConfirm={() => handleModalConfirm(modalData)}
            loading={actionLoading}
          />
          <DeleteDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={(data) => {
              setModalData(data);
              handleModalConfirm('delete_shipment');
              setIsDeleteDialogOpen(false);
            }}
            loading={actionLoading}
          />
        </>
      )}

      {/* CR/V Dialogs */}
      {CRV_V1_ENABLED && CRV_UI_V1_ENABLED && !isNewStage && (
        <>
          <CreateCRDialog
            orderId={chatId}
            baseVersion={0}
            open={crvModal === 'create'}
            onClose={() => setCrvModal(null)}
          />
          <ApproveCRDialog
            orderId={chatId}
            crId={crvData?.crId}
            open={crvModal === 'approve'}
            onClose={() => setCrvModal(null)}
            actor={{ id: 'user-123', role: userRole }}
          />
          <RollbackDialog
            orderId={chatId}
            open={crvModal === 'rollback'}
            onClose={() => setCrvModal(null)}
            actorId="user-123"
          />
        </>
      )}

      {/* Lineage Panel */}
      {LINEAGE_V2_ENABLED && (
        <LineagePanel
          chatId={chatId}
          open={lineageOpen}
          onClose={() => setLineageOpen(false)}
        />
      )}

      {/* Chat V2 Drawers */}
      {CHAT_V2_ENABLED && !isNewStage && (
        <>
          {CHAT_V2_SETTINGS_ENABLED && (
            <ChatSettingsDrawer
              open={openSettings}
              onClose={() => setOpenSettings(false)}
              initial={{
                allowInvites: true,
                allowMentions: true
              } as any}
              onSave={handleSaveSettings}
              canEdit={canEditSettings('USER')}
            />
          )}
          {CHAT_V2_PARTICIPANTS_ENABLED && (
            <ParticipantsDrawer
              open={openParticipants}
              onClose={() => setOpenParticipants(false)}
              list={chat2Store?.chats[chatId]?.participants || []}
              onInvite={handleInviteParticipant}
              onToggleMute={handleToggleMute}
              canManage={canManageParticipants('USER')}
            />
          )}
        </>
      )}

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        chatId={chatId}
        shipmentData={qrData}
      />
    </div>
  );
}
