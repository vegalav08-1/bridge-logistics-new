'use client';
import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface FieldHintProps {
  hint: string;
  className?: string;
}

export function FieldHint({ hint, className = '' }: FieldHintProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      
      {isVisible && (
        <div className="absolute right-0 top-full mt-1 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="text-sm text-gray-700">
            {hint}
          </div>
          <div className="absolute -top-1 right-4 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}
