import { SELECTORS, type FinaleElements } from "../elements";
import { ARRIVE_AT, TOGETHER_PHOTO } from "./constants";
import { noteScaleFor } from "./note-finale";
import { pileLayout, type Rect } from "./pile-layout";

/** The together photo's resting box (viewport px), from its slot and its rendered size. */
function togetherRect(el: HTMLElement, vw: number, vh: number): Rect {
  const w = el.offsetWidth;
  return { x: vw / 2 + (TOGETHER_PHOTO.phone.x * vw) / 100 - w / 2, y: TOGETHER_PHOTO.phone.rest * vh, w, h: el.offsetHeight };
}

/**
 * Lays the phone memory photos out as a pile around the pinned note (see pile-layout) from the
 * current viewport and note size, writing each photo's width, spot and stacking order. Later photos
 * lie on top, the together photo above them all.
 */
export function placePile({ note, memoryPhotos }: Pick<FinaleElements, "note" | "memoryPhotos">): void {
  const photos = memoryPhotos.filter((el) => !el.matches(SELECTORS.memoryTogether));
  const together = memoryPhotos.find((el) => el.matches(SELECTORS.memoryTogether));
  if (photos.length === 0) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = noteScaleFor({ noteW: note.offsetWidth, noteH: note.offsetHeight, vw, vh });
  const noteW = note.offsetWidth * scale;
  const noteTop = ARRIVE_AT * vh;
  const rects = pileLayout({
    count: photos.length,
    viewportW: vw,
    viewportH: vh,
    note: { x: (vw - noteW) / 2, y: noteTop, w: noteW, h: note.offsetHeight * scale },
    chrome: photos[0].offsetHeight - photos[0].offsetWidth,
    obstacle: together && togetherRect(together, vw, vh),
  });
  photos.forEach((el, i) => {
    const { x, y, w } = rects[i];
    el.style.width = `${w}px`;
    el.style.setProperty("--x-phone", `${x + w / 2 - vw / 2}px`);
    el.style.setProperty("--top-phone", `${y - noteTop}px`);
    el.style.zIndex = String(i + 1);
  });
}
