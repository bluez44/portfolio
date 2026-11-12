import type { Action, Beat, NarrationKey, SectionMetrics } from "../types";
import { ARRIVE_ENDS_AT, CHEER_BY, CHEER_RY, DESK, FADE, LEAVE_MET_INSET, MIN_GAP, POINTING, PLAYING, RSVP_RELEASE_AT, TOSSING } from "./constants";

type RawBeat = [scroll: number, x: number, ry: number, act: Action, say?: NarrationKey];

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
  if (!f) return [[leave, DESK.x, DESK.ry, DESK.act, "desk"]];
  return [
    [f.start, DESK.x, DESK.ry, DESK.act, "desk"],
    [f.start + (f.grown - f.start) * CHEER_BY, cheerX, CHEER_RY, "cheer", "cheer"],
    [leave, cheerX, CHEER_RY, "cheer", "cheer"],
  ];
}

/** Scroll where the RSVP section's bottom edge reaches RSVP_RELEASE_AT of the viewport: the toss holds until then. */
function rsvpEnd(m: SectionMetrics): number {
  const bottom = m.rsvpHeight != null ? m.rsvpTop + m.rsvpHeight : m.wishesTop;
  return bottom - m.vh * RSVP_RELEASE_AT;
}

/** Scroll where the bee wall's bottom edge enters the viewport: the character plays until then. */
function wishesEnd(m: SectionMetrics, finaleTop: number): number {
  const bottom = m.wishesHeight != null ? m.wishesTop + m.wishesHeight : finaleTop;
  return bottom - m.vh;
}

/** Scroll-keyed poses for the whole invitation; `sx` is the slot beside the opened envelope card. */
export function buildBeats(m: SectionMetrics, sx: number, cheerX = DESK.x): Beat[] {
  const { vh, stageTop: s0, stageScroll: sl } = m;
  const [leave, arrive] = toEnds(m);
  const raw: RawBeat[] = [
    [s0, sx, -0.5, "wave", "wave"],
    [s0 + sl * 0.3, sx, -0.5, "wave", "wave"],
    [s0 + sl * 0.6, -sx, 0.5, "bow", "bow"],
    [s0 + sl, -sx, 0.5, "bow", "bow"],
    [m.metTop - vh * 0.1, DESK.x, DESK.ry, DESK.act, "desk"],
    ...metEndBeats(m, cheerX, leave),
    [arrive, POINTING.x, POINTING.ry, POINTING.act, "point"],
    [m.endsTop + m.endsHeight - vh * 0.9, POINTING.x, POINTING.ry, POINTING.act, "point"],
    [m.rsvpTop - vh * 0.25, TOSSING.x, TOSSING.ry, TOSSING.act, "toss"],
    [rsvpEnd(m), TOSSING.x, TOSSING.ry, TOSSING.act, "toss"],
    [m.wishesTop - vh * 0.2, PLAYING.x, PLAYING.ry, PLAYING.act, "play"],
    ...(m.finaleTop != null
      ? ([
          [wishesEnd(m, m.finaleTop), PLAYING.x, PLAYING.ry, PLAYING.act, "play"],
          [m.finaleTop, sx, -0.5, "wave", "farewell"],
        ] as RawBeat[])
      : []),
  ];
  let prev = -Infinity;
  return raw.map(([s, x, ry, act, say]) => {
    const at = Math.max(s, prev + MIN_GAP);
    prev = at;
    return { s: at, x, ry, act, ...(say ? { say } : {}) };
  });
}
