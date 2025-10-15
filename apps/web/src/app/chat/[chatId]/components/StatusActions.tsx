'use client';

import React from 'react';
import { cx } from '@/lib/cx';
import { Button } from '@/components/ui/Button';
import { Role, ShipmentStatus, StatusAction } from '@/lib/chat/types';
import { getActionsForRoleAndStatus } from '@/lib/chat/actions-map';
import IfCan from '@/lib/acl/IfCan';
import { useAbility } from '@/lib/acl/useAbility';

export interface StatusActionsProps {
  role: Role;
  status: ShipmentStatus;
  onAction: (key: string) => void;
  disabledKeys?: string[];
  className?: string;
}

export function StatusActions({ 
  role, 
  status, 
  onAction, 
  disabledKeys = [], 
  className 
}: StatusActionsProps) {
  const actions = getActionsForRoleAndStatus(role, status);
  const { ability } = useAbility();

  if (!actions || (actions.primary.length === 0 && (!actions.secondary || actions.secondary.length === 0))) {
    return null;
  }

  const handleActionClick = (action: StatusAction) => {
    if (action.disabled || disabledKeys.includes(action.key)) {
      return;
    }
    onAction(action.key);
  };

  return (
    <div className={cx('space-y-3', className)}>
      {/* Primary actions */}
      {actions.primary.length > 0 && (
        <div className="space-y-2">
          {actions.primary.map((action) => {
            // Определяем ACL ресурс и действие на основе action.key
            const getACLPermission = (key: string) => {
              if (key.includes('receive') || key.includes('reconcile') || key.includes('pack')) {
                return { resource: 'shipment' as const, action: 'transition' as const };
              }
              if (key.includes('merge')) {
                return { resource: 'shipment' as const, action: 'merge' as const };
              }
              if (key.includes('split')) {
                return { resource: 'shipment' as const, action: 'split' as const };
              }
              return { resource: 'shipment' as const, action: 'view' as const };
            };

            const acl = getACLPermission(action.key);
            
            return (
              <IfCan key={action.key} resource={acl.resource} action={acl.action} mode="disable">
                <Button
                  variant={action.variant === 'danger' ? 'destructive' : action.variant || 'primary'}
                  size="lg"
                  fullWidth
                  disabled={action.disabled || disabledKeys.includes(action.key)}
                  onClick={() => handleActionClick(action)}
                  icon={action.icon}
                  className="h-12 rounded-xl"
                  aria-label={action.tooltip || action.label}
                >
                  {action.label}
                </Button>
              </IfCan>
            );
          })}
        </div>
      )}

      {/* Secondary actions */}
      {actions.secondary && actions.secondary.length > 0 && (
        <div className="flex items-center justify-end space-x-2">
          {actions.secondary.map((action) => (
            <Button
              key={action.key}
              variant="ghost"
              size="sm"
              disabled={action.disabled || disabledKeys.includes(action.key)}
              onClick={() => handleActionClick(action)}
              icon={action.icon}
              className="h-10 px-3"
              aria-label={action.tooltip || action.label}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
