'use client';

export default function EmptyStateMini({ 
  title, 
  description, 
  action, 
  onAction 
}: { 
  title: string; 
  description: string; 
  action: string; 
  onAction: () => void; 
}) {
  return (
    <div className="text-center py-6">
      <div className="text-sm text-gray-500 mb-2">{title}</div>
      <div className="text-xs text-gray-400 mb-3">{description}</div>
      <button
        className="h-8 px-3 rounded-lg border text-sm"
        onClick={onAction}
      >
        {action}
      </button>
    </div>
  );
}

