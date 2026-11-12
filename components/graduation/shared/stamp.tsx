export function Stamp({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`box-border flex h-20.5 w-17 flex-col items-center justify-center gap-0.5 border-[1.5px] border-ink bg-canary outline-[3px] outline-offset-[-7px] outline-paper outline-dotted ${className}`}
      style={{ boxShadow: "var(--offset-sm)" }}
    >
      <span className="font-heading text-2xl leading-none font-bold text-ink">QV</span>
      <span className="font-mono text-[9px] tracking-[0.18em] text-ink">2026</span>
    </div>
  );
}
