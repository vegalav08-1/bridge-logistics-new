'use client';

import React, { useState } from 'react';
import { cx } from '@/lib/cx';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { X, Search, Package } from '@/components/icons';

export interface MergeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetChatId: string) => void;
  availableChats?: Array<{ id: string; number: string; title: string }>;
  loading?: boolean;
}

export function MergeDialog({
  isOpen,
  onClose,
  onConfirm,
  availableChats = [],
  loading = false
}: MergeDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string>('');

  const filteredChats = availableChats.filter(chat =>
    chat.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirm = () => {
    if (selectedChatId) {
      onConfirm(selectedChatId);
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
      aria-labelledby="merge-title"
    >
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle id="merge-title" className="text-lg font-semibold">
            Attach to Shipment
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
              Select a shipment to attach this one to.
            </p>
            
            <Input
              label="Search shipments"
              placeholder="Search by number or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              disabled={loading}
            />

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredChats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No shipments found</p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={cx(
                      'w-full p-3 rounded-lg border-2 transition-colors text-left',
                      'hover:bg-muted',
                      selectedChatId === chat.id 
                        ? 'border-brand bg-brand/5' 
                        : 'border-border'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Package className={cx(
                        'h-5 w-5',
                        selectedChatId === chat.id ? 'text-brand' : 'text-muted-foreground'
                      )} />
                      <div>
                        <div className="font-medium">{chat.number}</div>
                        <div className="text-sm text-muted-foreground">{chat.title}</div>
                      </div>
                    </div>
                  </button>
                ))
              )}
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
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!selectedChatId || loading}
            loading={loading}
          >
            Attach
          </Button>
        </div>
      </Card>
    </div>
  );
}


