import type { ReactNode } from "react";

const Rule = ({ grow }: { grow?: boolean }) => (
  <span aria-hidden className={`h-px bg-ink/20 ${grow ? "max-w-40 flex-1" : "w-12"}`} />
);

export function SectionKicker({ children, centered = false }: { children: ReactNode; centered?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {centered && <Rule />}
      <span className="font-mono text-[11px] tracking-[0.28em] text-ink-2 uppercase">{children}</span>
      <Rule grow={!centered} />
    </div>
  );
}
