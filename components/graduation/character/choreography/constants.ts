import type { Action } from "../types";

/** Minimum scroll distance (px) between consecutive beats, so transitions never collapse. */
export const MIN_GAP = 40;

/** Share of the note's grow phase by which the character has stood up, walked over and is cheering. */
export const CHEER_BY = 0.6;

/** Fallback width (px) of the envelope when it is not mounted: min(560px, 50vw). */
export const ENVELOPE_MAX_W = 560;
export const ENVELOPE_VW_SHARE = 0.5;
/** Scale the opened card reaches in the envelope stage (see use-envelope-timeline). */
export const OPENED_CARD_SCALE = 1.32;

/** Character footprint in world units at scale 1: half-width margin and the gap kept from objects. */
export const BODY_MARGIN = 1.3;
export const BODY_GAP = 0.7;

/** Stations as horizontal slot (−1..1), facing (rad) and action. */
type Station = { x: number; ry: number; act: Action };
export const DESK: Station = { x: 0.66, ry: -0.35, act: "sit" };
export const POINTING: Station = { x: -0.66, ry: 0.1, act: "point" };
export const TOSSING: Station = { x: 0.62, ry: 0, act: "toss" };
/** Facing while cheering beside the note (toward the centred card). */
export const CHEER_RY = -0.45;
