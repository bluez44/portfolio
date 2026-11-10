import { GROW, HOLD, NOTE_MAX_SCALE, NOTE_SIDE_GUTTER, NOTE_VIEWPORT_HEIGHT, PIN_VH, ARRIVE_AT } from "./constants";

export function noteScaleFor({ noteW, noteH, vw, vh }: { noteW: number; noteH: number; vw: number; vh: number }): number {
  if (!noteW || !noteH) return 1;
  const byHeight = (vh * NOTE_VIEWPORT_HEIGHT) / noteH;
  const byWidth = (vw - NOTE_SIDE_GUTTER * 2) / noteW;
  return Math.max(1, Math.min(byHeight, byWidth, NOTE_MAX_SCALE));
}

/** Scroll positions (px) of the finale, given the note wrapper's document top. */
export function noteFinaleScroll(noteTop: number, vh: number): { start: number; grown: number; end: number } {
  const start = noteTop - vh * ARRIVE_AT;
  const length = vh * PIN_VH;
  return { start, grown: start + (length * GROW) / (GROW + HOLD), end: start + length };
}
