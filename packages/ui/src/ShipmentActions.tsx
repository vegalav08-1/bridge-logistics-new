import React, { useState, useEffect } from 'react';
import { ActionButton } from './ActionButton';
import { cn } from './utils/cn';

export interface ShipmentAction {
  action: string;
  label: string;
  description: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export interface ShipmentActionsProps {
  chatId: string;
  status: string;
  userRole: string;
  onAction: (action: string, payload?: any) => Promise<void>;
  className?: string;
}

// Конфигурация действий для каждого статуса и роли
const actionConfig: Record<string, Record<string, ShipmentAction[]>> = {
  NEW: {
    ADMIN: [
      {
        action: 'receive.full',
        label: 'Груз принят',
        description: 'Подтвердить полную приёмку',
        variant: 'success',
      },
      {
        action: 'receive.partial',
        label: 'Частично принято',
        description: 'Указать недостающие позиции',
        variant: 'secondary',
      },
      {
        action: 'cancel',
        label: 'Отменить',
        description: 'Отменить отгрузку',
        variant: 'danger',
      },
    ],
    SUPER_ADMIN: [
      {
        action: 'receive.full',
        label: 'Груз принят',
        description: 'Подтвердить полную приёмку',
        variant: 'success',
      },
      {
        action: 'receive.partial',
        label: 'Частично принято',
        description: 'Указать недостающие позиции',
        variant: 'secondary',
      },
      {
        action: 'cancel',
        label: 'Отменить',
        description: 'Отменить отгрузку',
        variant: 'danger',
      },
    ],
  },
  
  RECEIVE: {
    ADMIN: [
      {
        action: 'reconcile.create',
        label: 'Создать сверку',
        description: 'Сформировать акт сверки',
        variant: 'primary',
      },
      {
        action: 'cancel',
        label: 'Отменить',
        description: 'Отменить отгрузку',
        variant: 'danger',
      },
    ],
    SUPER_ADMIN: [
      {
        action: 'reconcile.create',
        label: 'Создать сверку',
        description: 'Сформировать акт сверки',
        variant: 'primary',
      },
      {
        action: 'cancel',
        label: 'Отменить',
        description: 'Отменить отгрузку',
        variant: 'danger',
      },
    ],
  },
  
  RECONCILE: {
    USER: [
      {
        action: 'reconcile.confirm',
        label: 'Подтвердить сверку',
        description: 'Согласовать акт сверки',
        variant: 'success',
      },
    ],
    ADMIN: [
      {
        action: 'reconcile.confirm',
        label: 'Подтвердить сверку',
        description: 'Согласовать акт сверки',
        variant: 'success',
      },
      {
        action: 'cancel',
        label: 'Отменить',
        description: 'Отменить отгрузку',
        variant: 'danger',
      },
    ],
    SUPER_ADMIN: [
      {
        action: 'reconcile.confirm',
        label: 'Подтвердить сверку',
        description: 'Согласовать акт сверки',
        variant: 'success',
      },
      {
        action: 'cancel',
        label: 'Отменить',
        description: 'Отменить отгрузку',
        variant: 'danger',
      },
    ],
  },
  
  PACK: {
    ADMIN: [
      {
        action: 'pack.configure',
        label: 'Настроить упаковку',
        description: 'Указать параметры упаковки',
        variant: 'secondary',
      },
      {
        action: 'pack.complete',
        label: 'Завершить упаковку',
        description: 'Завершить процесс упаковки',
        variant: 'success',
      },
      {
        action: 'cancel',
        label: 'Отменить',
        description: 'Отменить отгрузку',
        variant: 'danger',
      },
    ],
    SUPER_ADMIN: [
      {
        action: 'pack.configure',
        label: 'Настроить упаковку',
        description: 'Указать параметры упаковки',
        variant: 'secondary',
      },
      {
        action: 'pack.complete',
        label: 'Завершить упаковку',
        description: 'Завершить процесс упаковки',
        variant: 'success',
      },
      {
        action: 'cancel',
        label: 'Отменить',
        description: 'Отменить отгрузку',
        variant: 'danger',
      },
    ],
  },
  
  MERGE: {
    ADMIN: [
      {
        action: 'merge.attach',
        label: 'Присоединить',
        description: 'Присоединить другие отгрузки',
        variant: 'secondary',
      },
      {
        action: 'merge.detach',
        label: 'Отсоединить',
        description: 'Отсоединить отгрузки',
        variant: 'secondary',
      },
      {
        action: 'merge.complete',
        label: 'Завершить совмещение',
        description: 'Завершить процесс совмещения',
        variant: 'success',
      },
      {
        action: 'cancel',
        label: 'Отменить',
        description: 'Отменить отгрузку',
        variant: 'danger',
      },
    ],
    SUPER_ADMIN: [
      {
        action: 'merge.attach',
        label: 'Присоединить',
        description: 'Присоединить другие отгрузки',
        variant: 'secondary',
      },
      {
        action: 'merge.detach',
        label: 'Отсоединить',
        description: 'Отсоединить отгрузки',
        variant: 'secondary',
      },
      {
        action: 'merge.complete',
        label: 'Завершить совмещение',
        description: 'Завершить процесс совмещения',
        variant: 'success',
      },
      {
        action: 'cancel',
        label: 'Отменить',
        description: 'Отменить отгрузку',
        variant: 'danger',
      },
    ],
  },
  
  IN_TRANSIT: {
    ADMIN: [
      {
        action: 'arrival.city',
        label: 'Прибыло в город',
        description: 'Отметить прибытие в город',
        variant: 'primary',
      },
      {
        action: 'cancel',
        label: 'Отменить',
        description: 'Отменить отгрузку',
        variant: 'danger',
      },
    ],
    SUPER_ADMIN: [
      {
        action: 'arrival.city',
        label: 'Прибыло в город',
        description: 'Отметить прибытие в город',
        variant: 'primary',
      },
      {
        action: 'cancel',
        label: 'Отменить',
        description: 'Отменить отгрузку',
        variant: 'danger',
      },
    ],
  },
  
  ON_DELIVERY: {
    USER: [
      {
        action: 'handover.confirm',
        label: 'Подтвердить выдачу',
        description: 'Подтвердить получение груза',
        variant: 'success',
      },
    ],
    ADMIN: [
      {
        action: 'handover.confirm',
        label: 'Подтвердить выдачу',
        description: 'Подтвердить выдачу груза',
        variant: 'success',
      },
      {
        action: 'cancel',
        label: 'Отменить',
        description: 'Отменить отгрузку',
        variant: 'danger',
      },
    ],
    SUPER_ADMIN: [
      {
        action: 'handover.confirm',
        label: 'Подтвердить выдачу',
        description: 'Подтвердить выдачу груза',
        variant: 'success',
      },
      {
        action: 'cancel',
        label: 'Отменить',
        description: 'Отменить отгрузку',
        variant: 'danger',
      },
    ],
  },
  
  DELIVERED: {
    ADMIN: [
      {
        action: 'archive',
        label: 'Архивировать',
        description: 'Переместить в архив',
        variant: 'secondary',
      },
    ],
    SUPER_ADMIN: [
      {
        action: 'archive',
        label: 'Архивировать',
        description: 'Переместить в архив',
        variant: 'secondary',
      },
    ],
  },
};

export function ShipmentActions({ 
  chatId, 
  status, 
  userRole, 
  onAction, 
  className 
}: ShipmentActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [availableActions, setAvailableActions] = useState<ShipmentAction[]>([]);

  // Получаем доступные действия для текущего статуса и роли
  useEffect(() => {
    const actions = actionConfig[status]?.[userRole] || [];
    setAvailableActions(actions);
  }, [status, userRole]);

  const handleAction = async (action: string) => {
    setLoading(action);
    try {
      await onAction(action);
    } catch (error) {
      console.error('Action failed:', error);
      // TODO: Show error toast
    } finally {
      setLoading(null);
    }
  };

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-sm font-medium text-gray-700">Доступные действия</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {availableActions.map((action) => (
          <ActionButton
            key={action.action}
            action={action.action}
            label={action.label}
            description={action.description}
            variant={action.variant}
            size="sm"
            loading={loading === action.action}
            onClick={() => handleAction(action.action)}
          />
        ))}
      </div>
    </div>
  );
}
