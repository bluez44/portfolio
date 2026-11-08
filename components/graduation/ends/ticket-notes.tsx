import { GRADUATION_EVENT as E } from "@/lib/graduation/event";

export function TicketNotes() {
  return (
    <ul className="col-span-full m-0 flex list-none flex-wrap gap-x-7 gap-y-2 border-t-[1.5px] border-dashed border-ink px-7 py-4 font-mono text-[11px] tracking-[0.14em] text-ink-2 uppercase">
      {E.notes.map((n) => <li key={n}>{n}</li>)}
    </ul>
  );
}
