'use client';
export default function EscalateDialog({ open, onClose, orderId }: { open: boolean; onClose: () => void; orderId: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center">
      <div className="bg-white rounded-2xl p-4 w-[520px] max-w-[95vw]">
        <div className="text-lg font-semibold">Escalate issue</div>
        <textarea className="mt-2 w-full rounded-xl border p-2" rows={4} placeholder="Describe the issue" />
        <div className="mt-3 flex justify-end gap-2">
          <button className="h-10 px-3 rounded-xl border" onClick={onClose}>Cancel</button>
          <button className="h-10 px-3 rounded-xl bg-[var(--brand)] text-white" onClick={onClose}>Send</button>
        </div>
      </div>
    </div>
  );
}

