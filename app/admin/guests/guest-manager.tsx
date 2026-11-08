import type { GuestListItem } from '@/lib/graduation/types';
import { GuestForm } from './guest-form';
import { GuestRow } from './guest-row';
import { GuestStats } from './guest-stats';

export function GuestManager({ guests }: { guests: GuestListItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      <GuestStats guests={guests} />
      <GuestForm />
      {guests.length === 0 ? (
        <p className="text-sm text-zinc-400">Chưa có khách nào.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {guests.map((g) => <GuestRow key={g.id} guest={g} />)}
        </ul>
      )}
    </div>
  );
}
