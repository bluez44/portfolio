import { OUTLINE_GAP, OUTLINE_RADIUS } from "./constants";
import { outlineHalves } from "./outline-path";
import type { FinaleElements } from "../elements";

/** Sizes the outline SVG to the note (plus the gap) and sets both halves' paths. */
export function layoutOutline({ note, outline, halves }: Pick<FinaleElements, "note" | "outline" | "halves">): void {
  const w = note.offsetWidth + OUTLINE_GAP * 2;
  const h = note.offsetHeight + OUTLINE_GAP * 2;
  outline.setAttribute("width", String(w));
  outline.setAttribute("height", String(h));
  outlineHalves(w, h, OUTLINE_RADIUS).forEach((path, i) => halves[i].setAttribute("d", path));
}
