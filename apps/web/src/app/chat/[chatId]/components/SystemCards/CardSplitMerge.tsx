export default function CardSplitMerge({ 
  type, 
  targetChatId, 
  lines, 
  atISO 
}:{ 
  type: 'split' | 'merge_attach' | 'merge_detach'; 
  targetChatId?: string; 
  lines?: { name: string; qty: number }[]; 
  atISO: string; 
}) {
  const getTitle = () => {
    switch (type) {
      case 'split': return 'Отделена часть';
      case 'merge_attach': return 'Присоединён чат';
      case 'merge_detach': return 'Отсоединён чат';
      default: return 'Операция';
    }
  };

  return (
    <div className="mx-6 my-2 rounded-xl bg-[var(--muted)] px-3 py-2 text-xs">
      <div className="font-medium text-gray-700">{getTitle()}</div>
      {targetChatId && (
        <div className="mt-1 text-gray-600">Чат: {targetChatId}</div>
      )}
      {lines && lines.length > 0 && (
        <div className="mt-1 space-y-1">
          {lines.map((line, i) => (
            <div key={i} className="flex justify-between">
              <span>{line.name}</span>
              <span className="font-medium">{line.qty}</span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-1 text-gray-500">{new Date(atISO).toLocaleString()}</div>
    </div>
  );
}


