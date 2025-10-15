import { 
  STATE_SHIPMENT_STATUSES, 
  LOGISTICS_ACTIONS, 
  STATE_USER_ROLES,
  validateTransition,
  getNextStatus,
  getAvailableActions,
  type StateShipmentStatus,
  type LogisticsAction,
  type StateUserRole,
  type StateMachineContext,
  type TransitionResult
} from './shipments';
import { validateActionPayload } from './validators';
import { FLAGS } from '@yp/shared';
import { logTransition, logAction, logError, logDwellTime } from './metrics';

// Интерфейс для работы с БД (будет импортирован динамически)
interface DatabaseContext {
  chat: {
    findUnique: (args: { where: { id: string } }) => Promise<{ id: string; status: string; type: string } | null>;
    update: (args: { where: { id: string }; data: { status: string; updatedAt: Date } }) => Promise<void>;
  };
  shipmentTransition: {
    create: (args: { data: any }) => Promise<{ id: string }>;
  };
  logisticsAction: {
    create: (args: { data: any }) => Promise<{ id: string }>;
  };
  message: {
    create: (args: { data: any }) => Promise<{ id: string; seq: number }>;
  };
  parcel: {
    createMany: (args: { data: any[] }) => Promise<void>;
    updateMany: (args: { where: any; data: any }) => Promise<void>;
  };
  $transaction: (fn: (tx: any) => Promise<any>) => Promise<any>;
}

// Кэш для идемпотентности
const idempotencyCache = new Map<string, TransitionResult>();

// Основная функция выполнения перехода
export async function performTransition(
  chatId: string,
  action: LogisticsAction,
  payload: unknown,
  byUserId: string,
  byUserRole: StateUserRole,
  clientId: string
): Promise<TransitionResult> {
  const startTime = Date.now();
  
  if (!FLAGS.STRICT_STATE_MACHINE) {
    return {
      success: false,
      from: STATE_SHIPMENT_STATUSES.NEW,
      to: null,
      error: 'State machine is disabled'
    };
  }

  // Проверяем идемпотентность
  const idempotencyKey = `${chatId}:${action}:${clientId}`;
  if (idempotencyCache.has(idempotencyKey)) {
    return idempotencyCache.get(idempotencyKey)!;
  }

  try {
    // Импортируем БД динамически
    const { prisma } = await import('@yp/db');
    const db = prisma as unknown as DatabaseContext;

    // Загружаем чат и проверяем текущий статус
    const chat = await db.chat.findUnique({
      where: { id: chatId }
    });

    if (!chat) {
      return {
        success: false,
        from: STATE_SHIPMENT_STATUSES.NEW,
        to: null,
        error: 'Chat not found'
      };
    }

    if (chat.type !== 'SHIPMENT') {
      return {
        success: false,
        from: chat.status as StateShipmentStatus,
        to: null,
        error: 'Chat is not a shipment'
      };
    }

    const currentStatus = chat.status as StateShipmentStatus;

    // Создаём контекст для валидации
    const context: StateMachineContext = {
      chatId,
      currentStatus,
      userId: byUserId,
      userRole: byUserRole,
      action,
      payload,
      clientId
    };

    // Валидируем переход
    const validation = validateTransition(context);
    if (!validation.valid) {
      logError(chatId, 'validation', validation.error || 'unknown');
      return {
        success: false,
        from: currentStatus,
        to: null,
        error: validation.error
      };
    }

    // Валидируем payload
    const payloadValidation = validateActionPayload(action, payload);
    if (!payloadValidation.valid) {
      logError(chatId, 'payload_validation', payloadValidation.error || 'unknown');
      return {
        success: false,
        from: currentStatus,
        to: null,
        error: payloadValidation.error
      };
    }

    // Получаем следующий статус
    const nextStatus = getNextStatus(currentStatus, action);

    // Выполняем транзакцию
    const result = await db.$transaction(async (tx) => {
      // Создаём LogisticsAction
      const actionRecord = await tx.logisticsAction.create({
        data: {
          chatId,
          type: action,
          byUserId,
          payload: JSON.stringify(payloadValidation.data),
        }
      });

      let transitionRecord = null;
      let systemMessage = null;

      // Если статус меняется, создаём переход
      if (nextStatus && nextStatus !== currentStatus) {
        transitionRecord = await tx.shipmentTransition.create({
          data: {
            chatId,
            from: currentStatus,
            to: nextStatus,
            byUserId,
            reason: getTransitionReason(action, payloadValidation.data),
            meta: JSON.stringify({ action, payload: payloadValidation.data }),
          }
        });

        // Обновляем статус чата
        await tx.chat.update({
          where: { id: chatId },
          data: {
            status: nextStatus,
            updatedAt: new Date(),
          }
        });

        // Создаём SystemCard
        systemMessage = await tx.message.create({
          data: {
            chatId,
            kind: 'system',
            seq: await getNextSeq(tx, chatId),
            payload: JSON.stringify(createSystemCardPayload(action, currentStatus, nextStatus, payloadValidation.data)),
          }
        });
      }

      // Выполняем побочные эффекты
      await performSideEffects(tx, action, chatId, payloadValidation.data, byUserId);

      return {
        actionId: actionRecord.id,
        auditId: transitionRecord?.id,
        systemMessage: systemMessage ? {
          id: systemMessage.id,
          seq: systemMessage.seq,
          payload: JSON.parse(systemMessage.payload as string)
        } : undefined
      };
    });

    const duration = Date.now() - startTime;
    
    // Логируем успешное выполнение
    logAction(chatId, action, duration, byUserId);
    if (nextStatus && nextStatus !== currentStatus) {
      logTransition(chatId, currentStatus, nextStatus, duration, byUserId);
    }

    const transitionResult: TransitionResult = {
      success: true,
      from: currentStatus,
      to: nextStatus,
      systemMessage: result.systemMessage,
      auditId: result.auditId,
      actionId: result.actionId
    };

    // Кэшируем результат для идемпотентности
    idempotencyCache.set(idempotencyKey, transitionResult);
    
    // Очищаем кэш через 5 минут
    setTimeout(() => {
      idempotencyCache.delete(idempotencyKey);
    }, 5 * 60 * 1000);

    return transitionResult;

  } catch (error) {
    const duration = Date.now() - startTime;
    logError(chatId, 'transition_failed', 'internal_error', error as Error);
    console.error('Transition failed:', error);
    return {
      success: false,
      from: STATE_SHIPMENT_STATUSES.NEW,
      to: null,
      error: 'Internal server error'
    };
  }
}

// Получить следующий seq для сообщения
async function getNextSeq(tx: any, chatId: string): Promise<number> {
  const lastMessage = await tx.message.findFirst({
    where: { chatId },
    orderBy: { seq: 'desc' },
    select: { seq: true }
  });
  
  return (lastMessage?.seq || 0) + 1;
}

// Получить причину перехода
function getTransitionReason(action: LogisticsAction, payload: any): string | null {
  switch (action) {
    case LOGISTICS_ACTIONS.RECEIVE_FULL:
      return 'Груз принят полностью';
    case LOGISTICS_ACTIONS.RECEIVE_PARTIAL:
      return 'Груз принят частично';
    case LOGISTICS_ACTIONS.RECONCILE_CREATE:
      return 'Создана сверка';
    case LOGISTICS_ACTIONS.RECONCILE_CONFIRM:
      return 'Сверка подтверждена';
    case LOGISTICS_ACTIONS.PACK_CONFIGURE:
      return 'Настроена упаковка';
    case LOGISTICS_ACTIONS.PACK_COMPLETE:
      return 'Упаковка завершена';
    case LOGISTICS_ACTIONS.MERGE_ATTACH:
      return 'Отгрузка присоединена';
    case LOGISTICS_ACTIONS.MERGE_DETACH:
      return 'Отгрузка отсоединена';
    case LOGISTICS_ACTIONS.MERGE_COMPLETE:
      return 'Совмещение завершено';
    case LOGISTICS_ACTIONS.ARRIVAL_CITY:
      return 'Прибыло в город';
    case LOGISTICS_ACTIONS.HANDOVER_CONFIRM:
      return 'Выдача подтверждена';
    case LOGISTICS_ACTIONS.CANCEL:
      return payload?.reason || 'Отменено';
    case LOGISTICS_ACTIONS.ARCHIVE:
      return 'Архивировано';
    default:
      return null;
  }
}

// Создать payload для SystemCard
function createSystemCardPayload(
  action: LogisticsAction,
  from: StateShipmentStatus,
  to: StateShipmentStatus | null,
  payload: any
): any {
  const basePayload = {
    kind: to ? 'state.changed' : 'action.performed',
    action,
    from,
    to,
    timestamp: new Date().toISOString(),
  };

  switch (action) {
    case LOGISTICS_ACTIONS.RECEIVE_FULL:
      return {
        ...basePayload,
        kind: 'receive.full',
        note: payload.note,
        photos: payload.photos,
      };
    
    case LOGISTICS_ACTIONS.RECEIVE_PARTIAL:
      return {
        ...basePayload,
        kind: 'receive.partial',
        missing: payload.missing,
        note: payload.note,
        photos: payload.photos,
      };
    
    case LOGISTICS_ACTIONS.RECONCILE_CREATE:
      return {
        ...basePayload,
        kind: 'reconcile.created',
        discrepancies: payload.discrepancies,
        document: payload.document,
      };
    
    case LOGISTICS_ACTIONS.RECONCILE_CONFIRM:
      return {
        ...basePayload,
        kind: 'reconcile.confirmed',
        by: payload.confirmedBy,
      };
    
    case LOGISTICS_ACTIONS.PACK_CONFIGURE:
      return {
        ...basePayload,
        kind: 'pack.configured',
        parcels: payload.parcels,
        packingType: payload.packingType,
      };
    
    case LOGISTICS_ACTIONS.PACK_COMPLETE:
      return {
        ...basePayload,
        kind: 'pack.completed',
        finalParcels: payload.finalParcels,
        packingType: payload.packingType,
        photos: payload.photos,
      };
    
    case LOGISTICS_ACTIONS.MERGE_ATTACH:
      return {
        ...basePayload,
        kind: 'merge.attached',
        children: payload.children,
      };
    
    case LOGISTICS_ACTIONS.MERGE_DETACH:
      return {
        ...basePayload,
        kind: 'merge.detached',
        children: payload.children,
      };
    
    case LOGISTICS_ACTIONS.MERGE_COMPLETE:
      return {
        ...basePayload,
        kind: 'merge.completed',
      };
    
    case LOGISTICS_ACTIONS.ARRIVAL_CITY:
      return {
        ...basePayload,
        kind: 'arrival.city',
        city: payload.city,
        hub: payload.hub,
        eta: payload.eta,
        trackingNumber: payload.trackingNumber,
      };
    
    case LOGISTICS_ACTIONS.HANDOVER_CONFIRM:
      return {
        ...basePayload,
        kind: 'handover.confirmed',
        by: payload.confirmedBy,
        confirmationType: payload.confirmationType,
        recipientName: payload.recipientName,
      };
    
    case LOGISTICS_ACTIONS.CANCEL:
      return {
        ...basePayload,
        kind: 'cancelled',
        reason: payload.reason,
      };
    
    case LOGISTICS_ACTIONS.ARCHIVE:
      return {
        ...basePayload,
        kind: 'archived',
      };
    
    default:
      return basePayload;
  }
}

// Выполнить побочные эффекты
async function performSideEffects(
  tx: any,
  action: LogisticsAction,
  chatId: string,
  payload: any,
  byUserId: string
): Promise<void> {
  switch (action) {
    case LOGISTICS_ACTIONS.PACK_CONFIGURE:
    case LOGISTICS_ACTIONS.PACK_COMPLETE:
      // Создаём/обновляем партии
      if (payload.parcels || payload.finalParcels) {
        const parcels = payload.parcels || payload.finalParcels;
        await tx.parcel.createMany({
          data: parcels.map((parcel: any) => ({
            chatId,
            code: parcel.code,
            weightKg: parcel.weightKg,
            lengthCm: parcel.lengthCm,
            widthCm: parcel.widthCm,
            heightCm: parcel.heightCm,
            volumeM3: parcel.volumeM3,
            pieces: parcel.pieces,
            kind: parcel.kind,
          })),
          skipDuplicates: true,
        });
      }
      break;

    case LOGISTICS_ACTIONS.MERGE_COMPLETE:
      // Обновляем статусы всех дочерних чатов
      if (payload.finalChildren) {
        await tx.chat.updateMany({
          where: {
            id: { in: payload.finalChildren },
            type: 'SHIPMENT',
          },
          data: {
            status: STATE_SHIPMENT_STATUSES.IN_TRANSIT,
            updatedAt: new Date(),
          }
        });
      }
      break;

    default:
      // Нет побочных эффектов
      break;
  }
}

// Получить доступные действия для чата
export async function getAvailableActionsForChat(
  chatId: string,
  userId: string,
  userRole: StateUserRole
): Promise<LogisticsAction[]> {
  try {
    const { prisma } = await import('@yp/db');
    
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { status: true, type: true }
    });

    if (!chat || chat.type !== 'SHIPMENT') {
      return [];
    }

    return getAvailableActions(chat.status as StateShipmentStatus, userRole);
  } catch (error) {
    console.error('Failed to get available actions:', error);
    return [];
  }
}

// Получить историю переходов для чата
export async function getTransitionHistory(chatId: string, limit = 50): Promise<any[]> {
  try {
    const { prisma } = await import('@yp/db');
    
    return await prisma.shipmentTransition.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        byUser: {
          select: { id: true, email: true, role: true }
        }
      }
    });
  } catch (error) {
    console.error('Failed to get transition history:', error);
    return [];
  }
}

// Получить историю действий для чата
export async function getActionHistory(chatId: string, limit = 50): Promise<any[]> {
  try {
    const { prisma } = await import('@yp/db');
    
    return await prisma.logisticsAction.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        byUser: {
          select: { id: true, email: true, role: true }
        }
      }
    });
  } catch (error) {
    console.error('Failed to get action history:', error);
    return [];
  }
}
