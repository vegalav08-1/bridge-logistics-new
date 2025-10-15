'use client';

import React from 'react';
import { cx } from '@/lib/cx';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { X } from '@/components/icons';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false
}: ConfirmDialogProps) {
  if (!isOpen) return null;

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle id="confirm-title" className="text-lg font-semibold">
            {title}
          </CardTitle>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>
        
        {description && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-6">
              {description}
            </p>
          </CardContent>
        )}

        <div className="flex items-center justify-end space-x-2 p-6 pt-0">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
}


