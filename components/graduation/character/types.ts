export type Action = "wave" | "bow" | "sit" | "point" | "toss" | "cheer" | "read";
export const ACTIONS: readonly Action[] = ["wave", "bow", "sit", "point", "toss", "cheer", "read"];

export type NarrationKey = "wave" | "bow" | "desk" | "cheer" | "point" | "toss" | "read" | "farewell";

export type Beat = { s: number; x: number; ry: number; act: Action; say?: NarrationKey };

export type PoseTarget = Record<Action | "walk" | "dir", number> & { x: number; ry: number };

export type SectionMetrics = {
  vh: number;
  stageTop: number;
  stageScroll: number;
  metTop: number;
  metHeight: number;
  endsTop: number;
  endsHeight: number;
  rsvpTop: number;
  /** Top of the bee-wall wishes section, where the character reads the honeycomb. */
  wishesTop: number;
  /** Top of the finale section, where the character says farewell. */
  finaleTop?: number;
  /** The pinned personal-note finale (scroll px) and the grown card's width (px), when present. */
  noteFinale?: { start: number; grown: number; end: number; width: number } | null;
};
