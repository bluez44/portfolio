import type { ReactNode } from "react";
import type { Tone } from "./halftone-seam";

export function GraduationSection({
  id,
  tone,
  align,
  className = "",
  children,
}: { id: string; tone: Tone; align: "left" | "right"; className?: string; children: ReactNode }) {
  const cols = align === "left" ? "min-[760px]:grid-cols-[8fr_4fr]" : "min-[760px]:grid-cols-[4fr_8fr]";
  return (
    <section
      id={id}
      className={`relative px-6 py-[clamp(80px,10vw,140px)] min-[760px]:px-[clamp(72px,8vw,128px)] ${className}`}
      style={{ background: `var(--${tone})` }}
    >
      <div className={`mx-auto grid max-w-6xl grid-cols-1 gap-12 ${cols}`}>
        {align === "right" && <div aria-hidden className="hidden min-[760px]:block" />}
        <div className="flex min-w-0 flex-col gap-10">{children}</div>
        {align === "left" && <div aria-hidden className="hidden min-[760px]:block" />}
      </div>
    </section>
  );
}
