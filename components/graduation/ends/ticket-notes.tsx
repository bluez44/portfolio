import { useCopy } from "../i18n/lang-context";

export function TicketNotes() {
  const { ends: t } = useCopy();
  return (
    <div className="col-span-full border-t-[1.5px] border-dashed border-ink px-7 py-4">
      {t.specialMessage && (
        <div className="mb-2.5 rounded border border-tomato/40 bg-tomato/10 px-3 py-1.5 font-sans text-xs font-semibold text-tomato">
          ★ {t.specialMessage}
        </div>
      )}
      <ul className="m-0 flex list-none flex-wrap gap-x-7 gap-y-2 p-0 font-mono text-[11px] tracking-[0.14em] text-ink-2 uppercase">
        {t.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}
