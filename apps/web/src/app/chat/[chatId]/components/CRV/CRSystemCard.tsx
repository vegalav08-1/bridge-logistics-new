'use client';
import DiffViewer from './DiffViewer';
export default function CRSystemCard({ cr }: { cr: any }) {
  return (
    <div className="rounded-xl border p-2 bg-white">
      <div className="text-xs text-gray-500">Change Request · {cr.status}</div>
      <div className="text-sm font-medium mt-1">{cr.rationale}</div>
      <div className="mt-2"><DiffViewer fields={cr.fields} /></div>
    </div>
  );
}

