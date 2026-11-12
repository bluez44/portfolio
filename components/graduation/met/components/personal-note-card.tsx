export function PersonalNoteCard({ label, note }: { label: string; note: string }) {
  return (
    <div className="relative flex flex-col gap-3 rounded-[8px] bg-paper-2 px-6.5 py-7">
      <span className="font-mono text-[11px] tracking-[0.24em] text-ink-3 uppercase">{label}</span>
      <p className="m-0 font-heading text-[clamp(20px,2.2vw,28px)] leading-[1.2] font-semibold tracking-[-0.02em] text-pretty">
        <span className="px-1" style={{ background: "linear-gradient(transparent 55%, var(--highlight) 55%)" }}>{note}</span>
      </p>
    </div>
  );
}
