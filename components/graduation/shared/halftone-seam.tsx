import type { CSSProperties } from "react";
import { seamLayers } from "./seam-layers";

export type Tone = "paper" | "paper-2" | "paper-3";

const HEIGHT = "clamp(28px, 4vw, 48px)";
const ROWS = 6;

/** Halftone fade from one section's paper into the next; same-tone neighbours get `paper-3` dots so the seam still shows. */
export function HalftoneSeam({ from, to }: { from: Tone; to: Tone }) {
  const dots = from === to ? "paper-3" : from;
  return (
    <div
      aria-hidden
      style={
        {
          "--cell": `calc(${HEIGHT} / ${ROWS})`,
          height: HEIGHT,
          backgroundColor: `var(--${to})`,
          ...seamLayers(ROWS, "var(--cell)", `var(--${dots})`),
        } as CSSProperties
      }
    />
  );
}
