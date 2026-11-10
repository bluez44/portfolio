import { useCopy } from "../i18n/lang-context";

export function ScrollHint() {
  const { stage } = useCopy();
  return (
    <div id="hint" className="flex flex-col items-center gap-1.5">
      <span className="font-mono text-[11px] tracking-[0.24em] text-ink-2 uppercase">{stage.scrollHint}</span>
      <span aria-hidden className="text-lg text-tomato" style={{ animation: "pulse-dot 1.6s var(--ease) infinite" }}>↓</span>
    </div>
  );
}
