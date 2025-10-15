export default function CardPartialOp({ 
  type, 
  lines, 
  comment, 
  atISO 
}:{ 
  type: 'receive' | 'deliver'; 
  lines: { name: string; qty: number }[]; 
  comment?: string; 
  atISO: string; 
}) {
  return (
    <div className="mx-6 my-2 rounded-xl bg-[var(--muted)] px-3 py-2 text-xs">
      <div className="font-medium text-gray-700">
        {type === 'receive' ? 'Частичный приём' : 'Частичная выдача'}
      </div>
      <div className="mt-1 space-y-1">
        {lines.map((line, i) => (
          <div key={i} className="flex justify-between">
            <span>{line.name}</span>
            <span className="font-medium">{line.qty}</span>
          </div>
        ))}
      </div>
      {comment && <div className="mt-1 text-gray-500 italic">"{comment}"</div>}
      <div className="mt-1 text-gray-500">{new Date(atISO).toLocaleString()}</div>
    </div>
  );
}


