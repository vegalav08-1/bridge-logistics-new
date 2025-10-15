'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { X, AlertTriangle } from '@/components/icons';

export interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reason: string; comment: string }) => void;
  loading?: boolean;
}

export function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  loading = false
}: DeleteDialogProps) {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm({ 
      reason: reason.trim(), 
      comment: comment.trim() 
    });
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
      aria-labelledby="delete-title"
    >
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle id="delete-title" className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Удалить отгрузку
          </CardTitle>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
            aria-label="Закрыть диалог"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ Внимание! Это действие необратимо
              </p>
              <p className="text-sm text-red-700 mt-1">
                Отгрузка будет удалена и товар будет возвращен поставщику в полном объеме.
                Чат перейдет в неактивный статус.
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-text">
                Причина удаления *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={loading}
              >
                <option value="">Выберите причину</option>
                <option value="damaged_goods">Поврежденные товары</option>
                <option value="wrong_items">Неправильные товары</option>
                <option value="quality_issues">Проблемы с качеством</option>
                <option value="supplier_error">Ошибка поставщика</option>
                <option value="customer_cancellation">Отмена клиентом</option>
                <option value="other">Другое</option>
              </select>
            </div>

            <Textarea
              label="Дополнительные комментарии"
              placeholder="Опишите детали ситуации..."
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
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || loading}
            loading={loading}
          >
            Удалить отгрузку
          </Button>
        </div>
      </Card>
    </div>
  );
}

