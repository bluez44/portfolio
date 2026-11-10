/**
 * DOM hooks for the "How we met" trail and finale. Components render these `data-*` attributes;
 * the animation looks them up here, so markup and behaviour agree on one list.
 */
export const SELECTORS = {
  base: "[data-trail-base]",
  draw: "[data-trail-draw]",
  rider: "[data-trail-badge]",
  dock: "[data-trail-dock]",
  end: "[data-trail-end]",
  pin: "[data-trail-pin]",
  note: "[data-note-scale]",
  outline: "[data-note-outline]",
  outlineHalf: "[data-outline-half]",
  moment: "[data-moment]",
  badgeSpin: "[data-badge-spin]",
} as const;

export type TrailElements = {
  root: HTMLElement;
  /** Faint dashed path: the route, also used for MotionPath and length measuring. */
  base: SVGPathElement;
  /** Solid path drawn behind the badge. */
  draw: SVGPathElement;
  rider: HTMLElement;
  /** In-flow wrapper of the note; never pinned, so its offset is stable. */
  end: HTMLElement;
  cards: HTMLElement[];
  spinners: HTMLElement[];
};

export type FinaleElements = {
  /** Pinned element inside `end`. */
  pin: HTMLElement;
  /** Scaled wrapper holding the outline SVG and the note card. */
  note: HTMLElement;
  /** Badge docked on the note's top edge. */
  dock: HTMLElement;
  outline: SVGSVGElement;
  halves: SVGPathElement[];
};

export function queryMomentTrail(root: HTMLElement): { trail: TrailElements; finale: FinaleElements } | null {
  const one = <T extends Element>(sel: string) => root.querySelector<T>(sel);
  const all = <T extends Element>(sel: string) => Array.from(root.querySelectorAll<T>(sel));
  const base = one<SVGPathElement>(SELECTORS.base);
  const draw = one<SVGPathElement>(SELECTORS.draw);
  const rider = one<HTMLElement>(SELECTORS.rider);
  const end = one<HTMLElement>(SELECTORS.end);
  const pin = one<HTMLElement>(SELECTORS.pin);
  const note = one<HTMLElement>(SELECTORS.note);
  const dock = one<HTMLElement>(SELECTORS.dock);
  const outline = one<SVGSVGElement>(SELECTORS.outline);
  const halves = all<SVGPathElement>(SELECTORS.outlineHalf);
  const cards = all<HTMLElement>(SELECTORS.moment);
  if (!base || !draw || !rider || !end || !pin || !note || !dock || !outline || halves.length !== 2 || cards.length === 0) {
    return null;
  }
  return {
    trail: { root, base, draw, rider, end, cards, spinners: all<HTMLElement>(SELECTORS.badgeSpin) },
    finale: { pin, note, dock, outline, halves },
  };
}
