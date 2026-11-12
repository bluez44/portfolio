import type { KeyboardEvent } from "react";

export type GuideTabId = "map" | "tour";

/** ARIA tablist; Left/Right arrows move between tabs. */
export function GuideTabs({
  tabs,
  active,
  label,
  idFor,
  onSelect,
}: {
  tabs: { id: GuideTabId; label: string }[];
  active: GuideTabId;
  label: string;
  idFor: (id: GuideTabId) => { tab: string; panel: string };
  onSelect: (id: GuideTabId) => void;
}) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = tabs[(tabs.findIndex((t) => t.id === active) + step + tabs.length) % tabs.length];
    onSelect(next.id);
    document.getElementById(idFor(next.id).tab)?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="flex self-start rounded-full border-[1.5px] border-ink bg-paper-2 p-0.75"
      style={{ boxShadow: "var(--offset-xs)" }}
    >
      {tabs.map(({ id, label: text }) => {
        const selected = id === active;
        return (
          <button
            key={id}
            id={idFor(id).tab}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={idFor(id).panel}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(id)}
            className={`riso-focus hit-area relative rounded-full border-0 px-4 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-(--dur-fast) ${
              selected ? "bg-canary text-ink" : "bg-transparent text-ink-3 hover:text-tomato"
            }`}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}
