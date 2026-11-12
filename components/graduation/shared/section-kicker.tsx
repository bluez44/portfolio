import type { ReactNode } from "react";

type Align = "start" | "center" | "end";

/** Rule classes per side: `start` drops the left rule, `end` the right one, and the far side grows. */
const LEFT: Record<Align, string> = { start: "hidden", center: "w-12", end: "max-w-40 flex-1" };
const RIGHT: Record<Align, string> = { start: "max-w-40 flex-1", center: "w-12", end: "hidden" };
const DESKTOP_LEFT: Record<Align, string> = {
  start: "min-[760px]:hidden",
  center: "min-[760px]:block min-[760px]:w-12 min-[760px]:max-w-none min-[760px]:flex-none",
  end: "min-[760px]:block min-[760px]:w-auto min-[760px]:max-w-40 min-[760px]:flex-1",
};
const DESKTOP_RIGHT: Record<Align, string> = {
  start: "min-[760px]:block min-[760px]:w-auto min-[760px]:max-w-40 min-[760px]:flex-1",
  center: "min-[760px]:block min-[760px]:w-12 min-[760px]:max-w-none min-[760px]:flex-none",
  end: "min-[760px]:hidden",
};
const DESKTOP_JUSTIFY: Record<Align, string> = {
  start: "min-[760px]:justify-start",
  center: "min-[760px]:justify-center",
  end: "min-[760px]:justify-end",
};

const Rule = ({ className }: { className: string }) => <span aria-hidden className={`h-px bg-ink/20 ${className}`} />;

export function SectionKicker({
  children,
  align = "start",
  desktopAlign = align,
}: {
  children: ReactNode;
  align?: Align;
  /** Alignment from the 760px breakpoint up; defaults to `align`. */
  desktopAlign?: Align;
}) {
  return (
    <div className={`flex items-center gap-3 ${DESKTOP_JUSTIFY[desktopAlign]}`}>
      <Rule className={`${LEFT[align]} ${DESKTOP_LEFT[desktopAlign]}`} />
      <span className="font-mono text-[11px] tracking-[0.28em] text-ink-2 uppercase">{children}</span>
      <Rule className={`${RIGHT[align]} ${DESKTOP_RIGHT[desktopAlign]}`} />
    </div>
  );
}
