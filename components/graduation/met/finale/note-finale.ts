import { GROW, NOTE_MAX_SCALE, NOTE_SIDE_GUTTER, NOTE_VIEWPORT_HEIGHT, ARRIVE_AT, finaleUnits, pinVh } from "./constants";
import { WIDE_FINALE, type FinaleProfile } from "./profile";

export function noteScaleFor({ noteW, noteH, vw, vh }: { noteW: number; noteH: number; vw: number; vh: number }): number {
  if (!noteW || !noteH) return 1;
  const byHeight = (vh * NOTE_VIEWPORT_HEIGHT) / noteH;
  const byWidth = (vw - NOTE_SIDE_GUTTER * 2) / noteW;
  return Math.max(1, Math.min(byHeight, byWidth, NOTE_MAX_SCALE));
}

/** Scroll positions (px) of the finale, given the note wrapper's document top. */
export function noteFinaleScroll(
  noteTop: number,
  vh: number,
  memoryCount: number,
  profile: FinaleProfile = WIDE_FINALE,
): { start: number; grown: number; end: number } {
  const start = noteTop - vh * ARRIVE_AT;
  const length = vh * pinVh(memoryCount, profile);
  return { start, grown: start + (length * GROW) / finaleUnits(memoryCount, profile), end: start + length };
}
