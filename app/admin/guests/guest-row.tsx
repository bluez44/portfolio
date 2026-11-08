'use client';

import { useCallback, useState } from 'react';
import type { GuestListItem } from '@/lib/graduation/types';
import { deleteGuestAction } from './actions';
import { CopyLinkButton } from './copy-link-button';
import { GuestForm } from './guest-form';

const RSVP_LABEL = { yes: 'Sẽ đến', no: 'Không đến' } as const;

export function GuestRow({ guest }: { guest: GuestListItem }) {
  const [editing, setEditing] = useState(false);
  const stopEditing = useCallback(() => setEditing(false), []);

  if (editing) {
    return (
      <li className="rounded border border-zinc-700 p-3">
        <GuestForm guest={guest} onDone={stopEditing} />
        <button type="button" onClick={stopEditing} className="mt-2 text-xs text-zinc-400">Cancel</button>
      </li>
    );
  }

  return (
    <li className="grid gap-2 rounded border border-zinc-800 p-3 text-sm sm:grid-cols-[1fr_1fr_2fr_auto_auto] sm:items-center">
      <span className="font-medium">{guest.name}</span>
      <code className="text-zinc-400">{guest.slug}</code>
      <span className="truncate text-zinc-400" title={guest.note ?? ''}>{guest.note ?? '—'}</span>
      <span className="text-xs">
        {guest.rsvpStatus ? RSVP_LABEL[guest.rsvpStatus] : '—'}
        {guest.rsvpUpdatedAt && (
          <span className="block text-zinc-500">{new Date(guest.rsvpUpdatedAt).toLocaleString('vi-VN')}</span>
        )}
      </span>
      <span className="flex gap-3">
        <CopyLinkButton slug={guest.slug} />
        <button type="button" onClick={() => setEditing(true)} className="text-xs text-zinc-300">Edit</button>
        <form
          action={deleteGuestAction}
          onSubmit={(e) => { if (!confirm(`Xoá ${guest.name}?`)) e.preventDefault(); }}
        >
          <input type="hidden" name="id" value={guest.id} />
          <button type="submit" className="text-xs text-red-300">Delete</button>
        </form>
      </span>
    </li>
  );
}
