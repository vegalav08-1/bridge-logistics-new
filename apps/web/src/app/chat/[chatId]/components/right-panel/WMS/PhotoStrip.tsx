'use client';
export default function PhotoStrip({ items, onPick }: { items: any[]; onPick: (file: File) => void }) {
  const pick = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) onPick(e.target.files[0]); };
  return (
    <div className="rounded-2xl border p-2">
      <div className="flex gap-2 overflow-auto">
        {items.map(ph => <img key={ph.id} src={ph.url} className="h-16 w-16 object-cover rounded-lg border" />)}
        <label className="h-16 w-16 rounded-lg border grid place-items-center text-xs cursor-pointer">
          + Photo
          <input type="file" accept="image/*" className="hidden" onChange={pick} />
        </label>
      </div>
    </div>
  );
}

