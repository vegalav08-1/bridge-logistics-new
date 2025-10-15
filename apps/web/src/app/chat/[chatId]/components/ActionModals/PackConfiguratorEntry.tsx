'use client';

import React from 'react';
import { cx } from '@/lib/cx';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { X, Package, Settings } from '@/components/icons';

export interface PackConfiguratorEntryProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConfigurator: () => void;
  chatId: string;
}

export function PackConfiguratorEntry({
  isOpen,
  onClose,
  onOpenConfigurator,
  chatId
}: PackConfiguratorEntryProps) {
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
      aria-labelledby="pack-config-title"
    >
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle id="pack-config-title" className="text-lg font-semibold">
            Packing Configurator
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
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center">
              <Package className="h-8 w-8 text-brand" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-text mb-2">
                Packing Configuration
              </h3>
              <p className="text-sm text-muted-foreground">
                Open the advanced packing configurator to set up dimensions, 
                weight, and create parcel labels.
              </p>
            </div>
          </div>
        </CardContent>

        <div className="flex items-center justify-end space-x-2 p-6 pt-0">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onOpenConfigurator();
              onClose();
            }}
            icon={<Settings className="h-4 w-4" />}
          >
            Open Configurator
          </Button>
        </div>
      </Card>
    </div>
  );
}


