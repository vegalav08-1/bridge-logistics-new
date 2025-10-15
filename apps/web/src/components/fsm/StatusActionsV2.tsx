'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { useFSM } from '@/lib/fsm/useFSM';
import { allowedTransitions } from '@/lib/fsm/graph';
import { Role, ShipmentStatus } from '@/lib/fsm/types';
import IfCan from '@/lib/acl/IfCan';
import { useAbility } from '@/lib/acl/useAbility';

export interface StatusActionsV2Props {
  chatId: string;
  role: Role;
  status: ShipmentStatus;
  onAction: (key: string, payload?: any) => void;
  disabledKeys?: string[];
  className?: string;
}

export function StatusActionsV2({
  chatId,
  role,
  status,
  onAction,
  disabledKeys = [],
  className
}: StatusActionsV2Props) {
  const { ability } = useAbility();
  const fsm = useFSM(chatId, status);
  
  // Получаем разрешенные переходы для текущего статуса и роли
  const transitions = allowedTransitions(status, role, {
    hasDebt: false, // TODO: получать из контекста
    hasReconcile: true, // TODO: получать из контекста
  });

  if (transitions.length === 0) {
    return null;
  }

  const handleAction = (key: string, payload?: any) => {
    if (disabledKeys.includes(key)) return;
    
    // Определяем ACL ресурс и действие
    const getACLPermission = (actionKey: string) => {
      if (actionKey.includes('receive') || actionKey.includes('reconcile') || actionKey.includes('pack')) {
        return { resource: 'shipment' as const, action: 'transition' as const };
      }
      if (actionKey.includes('merge')) {
        return { resource: 'shipment' as const, action: 'merge' as const };
      }
      if (actionKey.includes('split')) {
        return { resource: 'shipment' as const, action: 'split' as const };
      }
      return { resource: 'shipment' as const, action: 'view' as const };
    };

    const acl = getACLPermission(key);
    
    // Проверяем права доступа
    if (!ability.can(acl.resource, acl.action)) {
      console.warn(`Access denied for ${acl.resource}:${acl.action}`);
      return;
    }

    // Выполняем FSM операцию
    if (key === 'receive_partial' || key === 'deliver_partial') {
      fsm.run(key, payload);
    } else if (key === 'split') {
      fsm.split(payload);
    } else if (key === 'merge_attach') {
      fsm.mergeAttach(payload);
    } else if (key === 'merge_detach') {
      fsm.mergeDetach(payload.targetChatId);
    } else {
      fsm.run(key, payload);
    }

    onAction(key, payload);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {transitions.map((transition) => {
        const acl = getACLPermission(transition.key);
        const isDisabled = disabledKeys.includes(transition.key) || fsm.busy;
        
        return (
          <IfCan
            key={transition.key}
            resource={acl.resource}
            action={acl.action}
            mode="disable"
          >
            <Button
              variant={transition.key.includes('cancel') ? 'destructive' : 'primary'}
              size="lg"
              fullWidth
              disabled={isDisabled}
              onClick={() => handleAction(transition.key)}
              className="h-12 rounded-xl"
            >
              {getActionLabel(transition.key)}
            </Button>
          </IfCan>
        );
      })}
      
      {fsm.error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">
          {fsm.error}
        </div>
      )}
    </div>
  );
}

function getACLPermission(actionKey: string) {
  if (actionKey.includes('receive') || actionKey.includes('reconcile') || actionKey.includes('pack')) {
    return { resource: 'shipment' as const, action: 'transition' as const };
  }
  if (actionKey.includes('merge')) {
    return { resource: 'shipment' as const, action: 'merge' as const };
  }
  if (actionKey.includes('split')) {
    return { resource: 'shipment' as const, action: 'split' as const };
  }
  return { resource: 'shipment' as const, action: 'view' as const };
}

function getActionLabel(key: string): string {
  const labels: Record<string, string> = {
    'receive_full': 'Полный приём',
    'receive_partial': 'Частичный приём',
    'start_reconcile': 'Начать сверку',
    'finish_reconcile': 'Завершить сверку',
    'open_packing': 'Упаковать',
    'attach_merge': 'Присоединить',
    'detach_merge': 'Отсоединить',
    'finish_merge': 'Завершить объединение',
    'arrive_to_city': 'Прибыл в город',
    'deliver_full': 'Полная доставка',
    'deliver_partial': 'Частичная доставка',
    'cancel': 'Отменить',
  };
  
  return labels[key] || key;
}


