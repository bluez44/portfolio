import type { BubblePlacement } from "../bubble-placement";
import { WIDE_STATIONS, type Stations } from "./constants";

/**
 * How the character is staged. Wide screens: full size, walking between stations beside the
 * content, the bubble above its head. Phones: small, every station in a bottom corner with the
 * bubble beside the head, and off stage while the note finale fills the screen with memories.
 */
export type CharacterProfile = {
  scale: number;
  stations: Stations;
  /**
   * Fixed slots on phones: `side` for the envelope stations, `cheer` during the note finale and
   * `farewell` for the last section; `null` measures beside the envelope and the note.
   */
  slots: { side: number; cheer: number; farewell: number } | null;
  bubble: BubblePlacement;
};

export const WIDE_CHARACTER: CharacterProfile = { scale: 0.85, stations: WIDE_STATIONS, slots: null, bubble: { side: "above", gap: 70 } };

const CORNER = 1;
/** A slot past the right edge: the character walks out of view. */
const OFF_STAGE = 2.2;
/** Farewell slot: tucked a little past the left corner, as the closing buttons reach the right one and its cap would touch the closing text. */
const FAREWELL = -1.25;

const toCorner = (stations: Stations): Stations =>
  Object.fromEntries(Object.entries(stations).map(([key, s]) => [key, { ...s, x: Math.sign(s.x) * CORNER }])) as Stations;

export const COMPACT_CHARACTER: CharacterProfile = {
  scale: 0.38,
  stations: toCorner(WIDE_STATIONS),
  slots: { side: CORNER, cheer: OFF_STAGE, farewell: FAREWELL },
  bubble: { side: "beside", gap: 22 },
};

export const characterProfile = (compact: boolean): CharacterProfile => (compact ? COMPACT_CHARACTER : WIDE_CHARACTER);
