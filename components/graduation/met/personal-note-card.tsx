export function PersonalNoteCard({ guestName, vi, en }: { guestName: string; vi: string; en: string }) {
  return (
    <div className="relative flex flex-col gap-3 rounded-[14px] border-[1.5px] border-ink bg-paper px-[26px] py-7" style={{ boxShadow: "6px 6px 0 var(--canary)" }}>
      <span className="font-mono text-[11px] tracking-[0.24em] text-ink-3 uppercase">Và bạn · And you, {guestName}</span>
      <p className="m-0 font-heading text-[clamp(20px,2.2vw,28px)] leading-[1.2] font-semibold tracking-[-0.02em] text-pretty">
        <span className="px-1" style={{ background: "linear-gradient(transparent 55%, var(--canary) 55%)" }}>{vi}</span>
      </p>
      <span className="text-sm text-ink-3 italic">{en}</span>
    </div>
  );
}
