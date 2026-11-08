'use client';

import { useActionState, useEffect, useRef } from 'react';
import type { GuestListItem } from '@/lib/graduation/types';
import { saveGuestAction } from './actions';

const input = 'w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-sm outline-none focus:border-zinc-500';

export function GuestForm({ guest, onDone }: { guest?: GuestListItem; onDone?: () => void }) {
  const [state, action, pending] = useActionState(saveGuestAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state && !state.ok ? state.fieldErrors : {};

  useEffect(() => {
    if (!state?.ok) return;
    if (!guest) formRef.current?.reset();
    onDone?.();
  }, [state, guest, onDone]);

  return (
    <form ref={formRef} action={action} className="grid gap-2 sm:grid-cols-[1fr_1fr_2fr_auto] sm:items-start">
      {guest && <input type="hidden" name="id" value={guest.id} />}
      <label className="grid gap-1">
        <input name="name" placeholder="Tên hiển thị" defaultValue={guest?.name} className={input} required />
        {errors.name && <span className="text-xs text-red-300">{errors.name}</span>}
      </label>
      <label className="grid gap-1">
        <input name="slug" placeholder="slug (tự sinh nếu trống)" defaultValue={guest?.slug} className={input} />
        {errors.slug && <span className="text-xs text-red-300">{errors.slug}</span>}
      </label>
      <label className="grid gap-1">
        <textarea name="note" rows={1} placeholder="Ghi chú riêng (tuỳ chọn)" defaultValue={guest?.note ?? ''} className={input} />
        {errors.note && <span className="text-xs text-red-300">{errors.note}</span>}
      </label>
      <button type="submit" disabled={pending} className="rounded bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50">
        {pending ? 'Saving…' : guest ? 'Save' : 'Add guest'}
      </button>
    </form>
  );
}
