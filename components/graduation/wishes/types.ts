export type WishBee = {
  /** opaque per-guest key; the real guest id never reaches the wall */
  key: string;
  /** the viewing guest's own wish */
  mine: boolean;
  /** alias shown instead of the guest's real name */
  name: string;
  init: string;
  /** dd.MM of the RSVP */
  date: string;
  msg: string;
  color: string;
  onColor: string;
};

export type CellStyle = "ink" | "tone";
export type CardStyle = "air" | "index";

const ACCENTS = ["var(--tomato)", "var(--blue)", "var(--jade)", "var(--canary)"] as const;

export function wishAccent(i: number): { color: string; onColor: string } {
  return { color: ACCENTS[i % 4], onColor: i % 4 === 3 ? "var(--on-canary)" : "var(--paper)" };
}
