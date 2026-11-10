import type { Action, Beat, SectionMetrics } from "../types";
import { ARRIVE_ENDS_AT, CHEER_BY, CHEER_RY, DESK, FADE, LEAVE_MET_INSET, MIN_GAP, POINTING, TOSSING } from "./constants";

type RawBeat = [scroll: number, x: number, ry: number, act: Action];

/**
 * Beat positions whose transition moves the character exactly over scroll `[start, end]`:
 * `targetPose` only moves between its fade-out and fade-in windows, so the beats sit just outside.
 */
export function moveSpan(start: number, end: number): [from: number, to: number] {
  const fade = ((end - start) / (1 - 2 * FADE)) * FADE;
  return [start - fade, end + fade];
}

/** Move from How we met to How it ends: starts as the section's bottom edge shows, ends at mid-screen. */
function toEnds(m: SectionMetrics): [leave: number, arrive: number] {
  const bottom = m.metTop + m.metHeight;
  return moveSpan(bottom - m.vh + LEAVE_MET_INSET, bottom - m.vh * ARRIVE_ENDS_AT);
}

/**
 * End of the "How we met" section. With the note finale the character sits until the note pins,
 * stands and walks to `cheerX` beside it while it grows, then cheers until it `leave`s.
 */
function metEndBeats(m: SectionMetrics, cheerX: number, leave: number): RawBeat[] {
  const f = m.noteFinale;
  if (!f) return [[leave, DESK.x, DESK.ry, DESK.act]];
  return [
    [f.start, DESK.x, DESK.ry, DESK.act],
    [f.start + (f.grown - f.start) * CHEER_BY, cheerX, CHEER_RY, "cheer"],
    [leave, cheerX, CHEER_RY, "cheer"],
  ];
}

/** Scroll-keyed poses for the whole invitation; `sx` is the slot beside the opened envelope card. */
export function buildBeats(m: SectionMetrics, sx: number, cheerX = DESK.x): Beat[] {
  const { vh, stageTop: s0, stageScroll: sl } = m;
  const [leave, arrive] = toEnds(m);
  const raw: RawBeat[] = [
    [s0, sx, -0.5, "wave"],
    [s0 + sl * 0.3, sx, -0.5, "wave"],
    [s0 + sl * 0.6, -sx, 0.5, "bow"],
    [s0 + sl, -sx, 0.5, "bow"],
    [m.metTop - vh * 0.1, DESK.x, DESK.ry, DESK.act],
    ...metEndBeats(m, cheerX, leave),
    [arrive, POINTING.x, POINTING.ry, POINTING.act],
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
