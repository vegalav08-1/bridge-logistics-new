'use client';

import React, { useState } from 'react';
import { User, Building2 } from 'lucide-react';
import { ProfileKind } from '@/lib/domain/profile';

interface ProfileTabsProps {
  currentKind: ProfileKind;
  onKindChange: (kind: ProfileKind) => void;
  disabled?: boolean;
}

export function ProfileTabs({ currentKind, onKindChange, disabled }: ProfileTabsProps) {
  const tabs = [
    {
      id: 'PERSON' as ProfileKind,
      label: 'Физическое лицо',
      icon: User,
      description: 'Для индивидуальных клиентов'
    },
    {
      id: 'COMPANY' as ProfileKind,
      label: 'Юридическое лицо', 
      icon: Building2,
      description: 'Для компаний и организаций'
    }
  ];

  return (
    <div className="border-b border-border">
      <nav className="flex space-x-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentKind === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => !disabled && onKindChange(tab.id)}
              disabled={disabled}
              className={`
                flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors
                ${isActive 
                  ? 'border-brand text-brand' 
                  : 'border-transparent text-muted-foreground hover:text-text hover:border-border'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Description */}
      <div className="mt-2 text-xs text-muted-foreground">
        {tabs.find(tab => tab.id === currentKind)?.description}
      </div>
    </div>
  );
}
