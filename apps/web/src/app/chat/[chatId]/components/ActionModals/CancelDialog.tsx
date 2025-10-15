'use client';

import React, { useState } from 'react';
import { cx } from '@/lib/cx';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { X, AlertTriangle } from '@/components/icons';

export interface CancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}

export function CancelDialog({
  isOpen,
  onClose,
  onConfirm,
  loading = false
}: CancelDialogProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
    }
  };

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
      aria-labelledby="cancel-title"
    >
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle id="cancel-title" className="text-lg font-semibold">
            Cancel Shipment
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
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm font-medium">
                This action cannot be undone
              </p>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Please provide a reason for cancelling this shipment.
            </p>
            
            <Textarea
              label="Cancellation Reason"
              placeholder="Explain why this shipment is being cancelled..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              rows={4}
              required
            />
          </div>
        </CardContent>

        <div className="flex items-center justify-end space-x-2 p-6 pt-0">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Keep Active
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || loading}
            loading={loading}
            icon={<AlertTriangle className="h-4 w-4" />}
          >
            Cancel Shipment
          </Button>
        </div>
      </Card>
    </div>
  );
}


