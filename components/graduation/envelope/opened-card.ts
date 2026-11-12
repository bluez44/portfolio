import { fitScale } from "@/lib/graduation/fit-scale";

const MAX_SCALE = 1.32;
const HEADER_H = 64;
const MARGIN = 16;

/** Scale the opened invitation card grows to: as large as `MAX_SCALE` while it still fits the viewport. */
export function openedCardScale(): number {
  const card = document.getElementById("card");
  if (!card) return MAX_SCALE;
  return fitScale({
    width: card.offsetWidth,
    height: card.scrollHeight,
    availW: window.innerWidth - MARGIN * 2,
    availH: window.innerHeight - HEADER_H - MARGIN * 3,
    max: MAX_SCALE,
  });
}
