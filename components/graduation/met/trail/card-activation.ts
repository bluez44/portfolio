import { smoothstep } from "@/lib/math/smoothstep";
import { ACTIVE_Z, REACH } from "./constants";
import type { TrailMetrics } from "./layout-trail";

/** Sets each card's `--a` (0..1) from how close the badge is to it along the trail. */
export function activateCards(cards: HTMLElement[], { stops, total }: TrailMetrics, progress: number): void {
  const at = progress * total;
  cards.forEach((card, i) => {
    const a = smoothstep(1 - Math.abs(at - stops[i]) / REACH);
    card.style.setProperty("--a", a.toFixed(3));
    card.style.zIndex = a > 0 ? ACTIVE_Z : "";
  });
}

/** Sets every card fully idle (0) or fully active (1). */
export function setCardsActivation(cards: HTMLElement[], a: 0 | 1): void {
  cards.forEach((card) => card.style.setProperty("--a", String(a)));
}
