'use client';
export default function MentionAutocomplete({
  query, items, onPick
}:{
  query:string; // после "@"
  items: Array<{ id:string; name:string }>;
  onPick: (item:{id:string; name:string}) => void;
}){
  if (!query) return null;
  const filtered = items.filter(i=> i.name.toLowerCase().startsWith(query.toLowerCase())).slice(0,8);
  if (!filtered.length) return null;
  return (
    <div className="absolute z-50 mt-1 rounded-xl border bg-white shadow p-1 w-[220px]">
      {filtered.map(i=>(
        <div key={i.id} className="px-2 py-1 text-sm rounded-lg hover:bg-gray-100 cursor-pointer" onMouseDown={(e)=>{e.preventDefault(); onPick(i);}}>
          @{i.name}
        </div>
      ))}
    </div>
  );
}

