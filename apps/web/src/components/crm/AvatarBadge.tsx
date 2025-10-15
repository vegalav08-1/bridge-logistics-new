'use client';
export default function AvatarBadge({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="h-10 w-10 rounded-full bg-[var(--brand)] text-white grid place-items-center text-sm font-medium">
      {initials}
    </div>
  );
}

