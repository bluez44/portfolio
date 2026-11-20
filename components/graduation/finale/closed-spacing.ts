import type { FlapLayout } from "./flap-clearance";

/** Space (px) left between the closed envelope and the countdown above it, and the closing text below it. */
export const CLOSED_GAP = 24;

type ClosedLayout = Pick<FlapLayout, "headerBottom" | "wrapTop" | "wrapBottom" | "footerTop">;

/**
 * How far (px) the countdown moves down and the closing text moves up so both sit `CLOSED_GAP` from
 * the closed envelope. Neither ever moves away from it.
 */
export function closedOffsets({ headerBottom, wrapTop, wrapBottom, footerTop }: ClosedLayout): { header: number; footer: number } {
  return {
    header: Math.max(0, wrapTop - CLOSED_GAP - headerBottom),
    footer: Math.min(0, wrapBottom + CLOSED_GAP - footerTop),
  };
}
