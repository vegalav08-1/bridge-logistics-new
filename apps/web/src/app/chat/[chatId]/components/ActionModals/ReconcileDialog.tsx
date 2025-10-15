'use client';

import React, { useState } from 'react';
import { cx } from '@/lib/cx';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { X, FileText } from '@/components/icons';

export interface ReconcileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { notes: string; files?: File[] }) => void;
  loading?: boolean;
}

export function ReconcileDialog({
  isOpen,
  onClose,
  onConfirm,
  loading = false
}: ReconcileDialogProps) {
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const handleConfirm = () => {
    onConfirm({ notes: notes.trim(), files: files.length > 0 ? files : undefined });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
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
      aria-labelledby="reconcile-title"
    >
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle id="reconcile-title" className="text-lg font-semibold">
            Create Reconciliation
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
              Create a reconciliation record for this shipment.
            </p>
            
            <Textarea
              label="Reconciliation Notes"
              placeholder="Describe any discrepancies, damages, or issues found during inspection..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              rows={4}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-text">
                Attach Files (optional)
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="reconcile-files"
                  disabled={loading}
                />
                <label
                  htmlFor="reconcile-files"
                  className="flex flex-col items-center justify-center space-y-2 cursor-pointer"
                >
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to attach photos or documents
                  </span>
                </label>
                {files.length > 0 && (
                  <div className="mt-2 text-sm text-text">
                    {files.length} file(s) selected
                  </div>
                )}
              </div>
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
            disabled={!notes.trim() || loading}
            loading={loading}
          >
            Create Reconciliation
          </Button>
        </div>
      </Card>
    </div>
  );
}


