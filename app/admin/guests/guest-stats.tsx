import type { GuestListItem } from '@/lib/graduation/types';

export function GuestStats({ guests }: { guests: GuestListItem[] }) {
  const yes = guests.filter((g) => g.rsvpStatus === 'yes').length;
  const no = guests.filter((g) => g.rsvpStatus === 'no').length;
  const items = [
    ['Total', guests.length],
    ['Sẽ đến', yes],
    ['Không đến', no],
    ['Chưa trả lời', guests.length - yes - no],
  ] as const;
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="rounded border border-zinc-800 bg-zinc-900 p-3">
          <dt className="text-xs uppercase tracking-wide text-zinc-400">{label}</dt>
          <dd className="text-2xl font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
