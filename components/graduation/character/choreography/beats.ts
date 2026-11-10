import type { Action, Beat, SectionMetrics } from "../types";
import { CHEER_BY, CHEER_RY, DESK, MIN_GAP, POINTING, TOSSING } from "./constants";

type RawBeat = [scroll: number, x: number, ry: number, act: Action];

/**
 * End of the "How we met" section. With the note finale the character sits until the note pins,
 * stands and walks to `cheerX` beside it while it grows, then cheers until the pin ends.
 */
function metEndBeats(m: SectionMetrics, cheerX: number): RawBeat[] {
  const f = m.noteFinale;
  if (!f) return [[m.metTop + m.metHeight - m.vh * 0.9, DESK.x, DESK.ry, DESK.act]];
  return [
    [f.start, DESK.x, DESK.ry, DESK.act],
    [f.start + (f.grown - f.start) * CHEER_BY, cheerX, CHEER_RY, "cheer"],
    [f.end, cheerX, CHEER_RY, "cheer"],
  ];
}

/** Scroll-keyed poses for the whole invitation; `sx` is the slot beside the opened envelope card. */
export function buildBeats(m: SectionMetrics, sx: number, cheerX = DESK.x): Beat[] {
  const { vh, stageTop: s0, stageScroll: sl } = m;
  const raw: RawBeat[] = [
    [s0, sx, -0.5, "wave"],
    [s0 + sl * 0.3, sx, -0.5, "wave"],
    [s0 + sl * 0.6, -sx, 0.5, "bow"],
    [s0 + sl, -sx, 0.5, "bow"],
    [m.metTop - vh * 0.1, DESK.x, DESK.ry, DESK.act],
    ...metEndBeats(m, cheerX),
    [m.endsTop - vh * 0.05, POINTING.x, POINTING.ry, POINTING.act],
    [m.endsTop + m.endsHeight - vh * 0.9, POINTING.x, POINTING.ry, POINTING.act],
    [m.rsvpTop - vh * 0.25, TOSSING.x, TOSSING.ry, TOSSING.act],
  ];
  let prev = -Infinity;
  return raw.map(([s, x, ry, act]) => {
    const at = Math.max(s, prev + MIN_GAP);
    prev = at;
    return { s: at, x, ry, act };
  });
}
