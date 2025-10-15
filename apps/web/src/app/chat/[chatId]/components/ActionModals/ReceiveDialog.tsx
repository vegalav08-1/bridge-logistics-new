'use client';

import React, { useState } from 'react';
import { cx } from '@/lib/cx';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { X } from '@/components/icons';

export interface ReceiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: 'full' | 'partial', comment?: string) => void;
  loading?: boolean;
}

export default function ReceiveDialog({
  isOpen,
  onClose,
  onConfirm,
  loading = false
}: ReceiveDialogProps) {
  // Для этапа NEW диалог не используется - функциональность перенесена в OrderStatusActions

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="receive-title"
    >
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle id="receive-title" className="text-lg font-semibold">
            Receive Shipment
          </CardTitle>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className="text-sm text-muted-foreground">
              Для этапа NEW используйте кнопки сканирования и принятия решения выше
            </div>
          </div>
        </CardContent>

        <div className="flex items-center justify-end space-x-2 p-6 pt-0">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}

