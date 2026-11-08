import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Page chrome for /graduation: slim header, <main> slot, footer.
 * Reuses the portfolio's riso design tokens (paper / ink / tomato / blue / canary / jade).
 */
export function GraduationShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b-[1.5px] border-ink bg-header-bg backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="font-mono text-[11px] tracking-[0.22em] text-ink-2 uppercase transition-colors hover:text-tomato"
          >
            ← Portfolio
          </Link>
          <span className="font-mono text-[11px] tracking-[0.28em] text-ink uppercase">
            Graduation 2026
          </span>
        </div>
      </header>

      <main id="top" className="flex-1">
        {children}
      </main>

      <footer className="border-t-[1.5px] border-ink bg-ink px-6 py-8 text-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 font-mono text-[11px] tracking-[0.18em] uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>Võ Lê Quang Vinh</span>
          <span className="text-canary">Thanks for celebrating with me</span>
        </div>
      </footer>
    </>
  );
}

/** Consistent section wrapper: numbered kicker + optional heading. */
export function GraduationSection({
  id,
  kicker,
  title,
  children,
  tone = "paper",
}: {
  id?: string;
  kicker: string;
  title?: ReactNode;
  children?: ReactNode;
  tone?: "paper" | "paper-2";
}) {
  return (
    <section
      id={id}
      className="relative border-t-[1.5px] border-ink px-6 py-[clamp(64px,9vw,120px)] first:border-t-0"
      style={{ background: `var(--${tone})` }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] tracking-[0.28em] text-ink-2 uppercase">
              {kicker}
            </span>
            <span aria-hidden className="h-px max-w-40 flex-1 bg-ink/20" />
          </div>
          {title && (
            <h2
              className="font-heading font-bold leading-[0.95] tracking-[-0.035em] text-ink"
              style={{
                fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)",
                fontVariationSettings: '"wdth" 90, "opsz" 96',
              }}
            >
              {title}
            </h2>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

/** Dashed placeholder block marking where real content should go. */
export function Slot({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`grid min-h-40 place-items-center rounded-[var(--r-round)] border-[1.5px] border-dashed border-ink/40 p-6 text-center ${className}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(-45deg, var(--paper-2) 0 12px, transparent 12px 24px)",
      }}
    >
      <p className="font-mono text-[12px] text-ink-2">[ {label} ]</p>
    </div>
  );
}
