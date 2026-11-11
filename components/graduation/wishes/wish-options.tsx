"use client";

export type OptionGroup<T extends string = string> = {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

function OptionPill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="cursor-pointer rounded-full border-[1.5px] border-ink px-4 py-2 font-sans text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        background: active ? "var(--canary)" : "var(--paper)",
        color: active ? "#1c1b1f" : "var(--ink)",
        boxShadow: active ? "var(--offset-sm)" : "none",
      }}
    >
      {label}
    </button>
  );
}

export function WishOptions({ groups }: { groups: OptionGroup[] }) {
  return (
    <div className="flex flex-[1_1_240px] flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] tracking-[0.28em] text-ink-2 uppercase">Phương án · Options</span>
        <span aria-hidden className="h-px flex-1 bg-ink/20" />
      </div>
      {groups.map((g) => (
        <div key={g.label} className="flex flex-col gap-2.5">
          <span className="font-mono text-[10px] tracking-[0.22em] text-ink-3 uppercase">{g.label}</span>
          <div className="flex flex-wrap gap-2.5">
            {g.options.map((o) => (
              <OptionPill key={o.value} active={g.value === o.value} label={o.label} onClick={() => g.onChange(o.value)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
