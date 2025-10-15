import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { 
  performTransition, 
  getAvailableActionsForChat, 
  getTransitionHistory, 
  getActionHistory 
} from './transitions';
import { TransitionRequestSchema } from './validators';
import { FLAGS } from '@yp/shared';

const router: Router = Router();

// Middleware для проверки аутентификации (заглушка)
function authenticateToken(req: any, res: any, next: any) {
  // TODO: Implement proper JWT authentication
  req.user = { id: 'mock-user', role: 'ADMIN' };
  next();
}

// POST /api/shipments/:chatId/transition
router.post('/:chatId/transition', authenticateToken, async (req: any, res: any) => {
  try {
    if (!FLAGS.STRICT_STATE_MACHINE) {
      return res.status(501).json({ error: 'State machine is disabled' });
    }

    const { chatId } = req.params;
    const { action, payload, clientId } = req.body;
    const { id: userId, role: userRole } = req.user;

    // Валидируем запрос
    const validation = TransitionRequestSchema.safeParse({
      action,
      payload,
      clientId,
    });

    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request',
        details: validation.error.errors,
      });
    }

    // Выполняем переход
    const result = await performTransition(
      chatId,
      action,
      payload,
      userId,
      userRole,
      clientId
    );

    if (!result.success) {
      return res.status(400).json({
        ok: false,
        error: result.error,
      });
    }

    res.json({
      ok: true,
      from: result.from,
      to: result.to,
      systemMessage: result.systemMessage,
      auditId: result.auditId,
      actionId: result.actionId,
    });

  } catch (error) {
    console.error('Transition endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/shipments/:chatId/actions
router.get('/:chatId/actions', authenticateToken, async (req: any, res: any) => {
  try {
    const { chatId } = req.params;
    const { id: userId, role: userRole } = req.user;

    const actions = await getAvailableActionsForChat(chatId, userId, userRole);

    res.json({
      actions: actions.map(action => ({
        action,
        label: getActionLabel(action),
        description: getActionDescription(action),
      })),
    });

  } catch (error) {
    console.error('Actions endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/shipments/:chatId/timeline
router.get('/:chatId/timeline', authenticateToken, async (req: any, res: any) => {
  try {
    const { chatId } = req.params;
    const { cursor, limit = 50 } = req.query;

    // Получаем историю переходов и действий
    const [transitions, actions] = await Promise.all([
      getTransitionHistory(chatId, Number(limit)),
      getActionHistory(chatId, Number(limit)),
    ]);

    // Объединяем и сортируем по времени
    const timeline = [
      ...transitions.map(t => ({
        id: t.id,
        type: 'transition' as const,
        timestamp: t.createdAt,
        data: {
          from: t.from,
          to: t.to,
          by: t.byUser,
          reason: t.reason,
          meta: t.meta ? JSON.parse(t.meta) : null,
        },
      })),
      ...actions.map(a => ({
        id: a.id,
        type: 'action' as const,
        timestamp: a.createdAt,
        data: {
          action: a.type,
          by: a.byUser,
          payload: a.payload ? JSON.parse(a.payload) : null,
        },
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({
      items: timeline,
      nextCursor: cursor, // TODO: Implement proper cursor pagination
      hasMore: timeline.length === Number(limit),
    });

  } catch (error) {
    console.error('Timeline endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/shipments/:chatId/status
router.get('/:chatId/status', authenticateToken, async (req: any, res: any) => {
  try {
    const { chatId } = req.params;

    // Импортируем БД динамически
    const { prisma } = await import('@yp/db');
    
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: {
        id: true,
        status: true,
        type: true,
        updatedAt: true,
        shipment: {
          select: {
            id: true,
            trackingNumber: true,
            status: true,
          }
        }
      }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (chat.type !== 'SHIPMENT') {
      return res.status(400).json({ error: 'Chat is not a shipment' });
    }

    res.json({
      chatId: chat.id,
      status: chat.status,
      type: chat.type,
      updatedAt: chat.updatedAt,
      shipment: chat.shipment,
      progress: getProgressPercentage(chat.status),
      color: getStatusColor(chat.status),
      label: getStatusLabel(chat.status),
    });

  } catch (error) {
    console.error('Status endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/shipments/:chatId/parcels
router.get('/:chatId/parcels', authenticateToken, async (req: any, res: any) => {
  try {
    const { chatId } = req.params;

    const { prisma } = await import('@yp/db');
    
    const parcels = await prisma.parcel.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ parcels });

  } catch (error) {
    console.error('Parcels endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/shipments/:chatId/parcels
router.post('/:chatId/parcels', authenticateToken, async (req: any, res: any) => {
  try {
    const { chatId } = req.params;
    const { parcels } = req.body;
    const user = req.user;

    if (!Array.isArray(parcels)) {
      return res.status(400).json({ error: 'Parcels must be an array' });
    }

    const { prisma } = await import('@yp/db');
    
    const createdParcels = await prisma.parcel.createMany({
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
        createdById: user.id,
      })),
    });

    res.json({ 
      success: true, 
      count: createdParcels.count 
    });

  } catch (error) {
    console.error('Create parcels endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Утилиты для UI
function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    'receive.full': 'Груз принят полностью',
    'receive.partial': 'Груз принят частично',
    'reconcile.create': 'Создать сверку',
    'reconcile.confirm': 'Подтвердить сверку',
    'pack.configure': 'Настроить упаковку',
    'pack.complete': 'Завершить упаковку',
    'merge.attach': 'Присоединить отгрузку',
    'merge.detach': 'Отсоединить отгрузку',
    'merge.complete': 'Завершить совмещение',
    'arrival.city': 'Прибыло в город',
    'handover.confirm': 'Подтвердить выдачу',
    'cancel': 'Отменить',
    'archive': 'Архивировать',
  };
  
  return labels[action] || action;
}

function getActionDescription(action: string): string {
  const descriptions: Record<string, string> = {
    'receive.full': 'Подтвердить полную приёмку груза',
    'receive.partial': 'Подтвердить частичную приёмку с указанием недостающих позиций',
    'reconcile.create': 'Создать акт сверки с указанием расхождений',
    'reconcile.confirm': 'Подтвердить акт сверки',
    'pack.configure': 'Настроить параметры упаковки',
    'pack.complete': 'Завершить процесс упаковки',
    'merge.attach': 'Присоединить другие отгрузки к текущей',
    'merge.detach': 'Отсоединить отгрузки от текущей',
    'merge.complete': 'Завершить процесс совмещения отгрузок',
    'arrival.city': 'Отметить прибытие в город назначения',
    'handover.confirm': 'Подтвердить выдачу груза получателю',
    'cancel': 'Отменить отгрузку',
    'archive': 'Архивировать завершённую отгрузку',
  };
  
  return descriptions[action] || '';
}

function getProgressPercentage(status: string): number {
  const progressMap: Record<string, number> = {
    'REQUEST': 0,
    'NEW': 10,
    'RECEIVE': 20,
    'RECONCILE': 30,
    'PACK': 40,
    'MERGE': 50,
    'IN_TRANSIT': 70,
    'ON_DELIVERY': 90,
    'DELIVERED': 100,
    'ARCHIVED': 100,
    'CANCELLED': 0,
  };
  
  return progressMap[status] || 0;
}

function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'REQUEST': 'green',
    'NEW': 'blue',
    'RECEIVE': 'yellow',
    'RECONCILE': 'orange',
    'PACK': 'purple',
    'MERGE': 'indigo',
    'IN_TRANSIT': 'cyan',
    'ON_DELIVERY': 'pink',
    'DELIVERED': 'green',
    'ARCHIVED': 'gray',
    'CANCELLED': 'red',
  };
  
  return colorMap[status] || 'gray';
}

function getStatusLabel(status: string): string {
  const labelMap: Record<string, string> = {
    'REQUEST': 'Запрос',
    'NEW': 'Новая отгрузка',
    'RECEIVE': 'Приёмка',
    'RECONCILE': 'Сверка',
    'PACK': 'Упаковка',
    'MERGE': 'Совмещение',
    'IN_TRANSIT': 'В пути',
    'ON_DELIVERY': 'К выдаче',
    'DELIVERED': 'Выдано',
    'ARCHIVED': 'Архив',
    'CANCELLED': 'Отменено',
  };
  
  return labelMap[status] || status;
}

export { router as stateRouter };
