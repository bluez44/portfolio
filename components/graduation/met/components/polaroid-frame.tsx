import type { ReactNode } from "react";
import { Tape } from "../../shared/tape";

/**
 * Polaroid-style photo frame with an authentic bottom chin and washi tape.
 * The photo area marked with [data-polaroid-photo] transitions from raw film
 * to full clarity in `finale-timeline.ts`.
 */
export function PolaroidFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative flex flex-col rounded-[14px] border-[1.5px] border-ink bg-paper p-3 pb-5 shadow-[6px_6px_0_var(--canary)]"
    >
      <Tape color="canary" width={84} height={22} rotate={-2} className="-top-3 z-10" />
      <div data-polaroid-photo className="overflow-hidden rounded-[8px]">
        {children}
      </div>
    </div>
  );
}
