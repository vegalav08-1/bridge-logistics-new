import React from 'react';

export interface ChatHeaderProps {
  number: string;
  type: string;
  status: string;
  onBack?: () => void;
}

export function ChatHeader({ number, type, status, onBack }: ChatHeaderProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'REQUEST':
        return 'bg-emerald-100 text-emerald-800';
      case 'SHIPMENT':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUEST':
        return 'bg-orange-100 text-orange-800';
      case 'NEW':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-lg font-semibold text-gray-900">#{number}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(type)}`}>
                {type}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                {status}
              </span>
            </div>
          </div>
        </div>
        <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}





