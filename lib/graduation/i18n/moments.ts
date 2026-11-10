import type { Moment } from "./types";

/** Language-neutral look of each "How we met" card; copy files add the text. */
const MOMENT_STYLE = [
  { n: "01", year: "2022", color: "tomato", rot: -1.6, image: "/me.jpg" },
  { n: "02", year: "2023", color: "blue", rot: 1.4, image: "/me%202.jpg" },
  { n: "03", year: "2025", color: "jade", rot: -1.2, image: "/tma.webp" },
  { n: "04", year: "2026", color: "canary", rot: 1.8, image: "/portrait.jpg" },
] as const;

export const withMomentStyle = (text: { title: string; body: string }[]): Moment[] =>
  MOMENT_STYLE.map((style, i) => ({ ...style, ...text[i] }));
