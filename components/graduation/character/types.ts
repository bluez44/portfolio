export type Action = "wave" | "bow" | "sit" | "point" | "toss" | "cheer";
export const ACTIONS: readonly Action[] = ["wave", "bow", "sit", "point", "toss", "cheer"];

export type Beat = { s: number; x: number; ry: number; act: Action };

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
  /** The pinned personal-note finale (scroll px) and the grown card's width (px), when present. */
  noteFinale?: { start: number; grown: number; end: number; width: number } | null;
};
