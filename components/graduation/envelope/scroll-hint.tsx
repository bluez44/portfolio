export function ScrollHint() {
  return (
    <div id="hint" className="flex flex-col items-center gap-1.5">
      <span className="font-mono text-[11px] tracking-[0.24em] text-ink-2 uppercase">Cuộn để mở thư · Scroll to open</span>
      <span aria-hidden className="text-lg text-tomato" style={{ animation: "pulse-dot 1.6s var(--ease) infinite" }}>↓</span>
    </div>
  );
}
