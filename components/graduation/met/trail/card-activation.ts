import { smoothstep } from "@/lib/math/smoothstep";
import { ACTIVE_Z, REACH } from "./constants";
import type { TrailMetrics } from "./layout-trail";

/** Sets one card's `--a` (0..1), lifting it above its neighbours while it is active at all. */
export function setCardActivation(card: HTMLElement, a: number): void {
  card.style.setProperty("--a", a.toFixed(3));
  card.style.zIndex = a > 0 ? ACTIVE_Z : "";
}

/** Sets each card's `--a` (0..1) from how close the badge is to it along the trail. */
export function activateCards(cards: HTMLElement[], { stops, total }: TrailMetrics, progress: number): void {
  const at = progress * total;
  cards.forEach((card, i) => setCardActivation(card, smoothstep(1 - Math.abs(at - stops[i]) / REACH)));
}

/** Sets every card fully idle (0) or fully active (1). */
export function setCardsActivation(cards: HTMLElement[], a: 0 | 1): void {
  cards.forEach((card) => card.style.setProperty("--a", String(a)));
}
