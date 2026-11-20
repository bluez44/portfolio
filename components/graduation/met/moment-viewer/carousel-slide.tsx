import type { CSSProperties, ReactNode } from "react";
import { CARD_LIFT, CARD_VW } from "../carousel/constants";

/**
 * One slide of the viewer carousel. `--a` (0..1, from use-moment-carousel) focuses it: lifted and
 * straightened from its resting tilt `rot` (deg).
 */
export function CarouselSlide({ rot, children }: { rot: number; children: ReactNode }) {
  return (
    <li
      data-moment
      className="w-(--card-w) shrink-0 snap-center"
      style={
        {
          "--a": 0,
          "--card-w": `${CARD_VW}vw`,
          transform: `rotate(calc(${rot}deg * (1 - var(--a)))) scale(calc(1 + var(--a) * ${CARD_LIFT}))`,
        } as CSSProperties
      }
    >
      {children}
    </li>
  );
}
