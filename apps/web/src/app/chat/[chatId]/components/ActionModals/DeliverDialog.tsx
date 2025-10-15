'use client';

import React, { useState } from 'react';
import { cx } from '@/lib/cx';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { X, Truck, User } from '@/components/icons';

export interface DeliverDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { recipient: string; comment?: string }) => void;
  loading?: boolean;
}

export function DeliverDialog({
  isOpen,
  onClose,
  onConfirm,
  loading = false
}: DeliverDialogProps) {
  const [recipient, setRecipient] = useState('');
  const [comment, setComment] = useState('');

  const handleConfirm = () => {
    if (recipient.trim()) {
      onConfirm({ 
        recipient: recipient.trim(), 
        comment: comment.trim() || undefined 
      });
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
      aria-labelledby="deliver-title"
    >
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle id="deliver-title" className="text-lg font-semibold">
            Deliver Shipment
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
            <p className="text-sm text-muted-foreground">
              Confirm that the shipment has been delivered to the recipient.
            </p>
            
            <Input
              label="Recipient"
              placeholder="Enter recipient name..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              icon={<User className="h-4 w-4" />}
              disabled={loading}
              required
            />

            <Textarea
              label="Comment (optional)"
              placeholder="Add any notes about the delivery..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={loading}
              rows={3}
            />
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
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!recipient.trim() || loading}
            loading={loading}
            icon={<Truck className="h-4 w-4" />}
          >
            Confirm Delivery
          </Button>
        </div>
      </Card>
    </div>
  );
}


