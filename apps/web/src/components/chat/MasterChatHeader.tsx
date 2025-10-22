'use client';

import React from 'react';
import { Crown, Users, ArrowRight } from 'lucide-react';

interface MasterChatHeaderProps {
  title: string;
  childrenCount: number;
  onArrivedClick: () => void;
  canManage: boolean;
}

export function MasterChatHeader({ 
  title, 
  childrenCount, 
  onArrivedClick, 
  canManage 
}: MasterChatHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-800">MASTER</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{childrenCount} отгрузок</span>
          </div>
          
          {canManage && (
            <button
              onClick={onArrivedClick}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
              Отметить как прибыло
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
