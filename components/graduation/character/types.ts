export type Action = "wave" | "bow" | "sit" | "point" | "toss";
export const ACTIONS: readonly Action[] = ["wave", "bow", "sit", "point", "toss"];

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
};
