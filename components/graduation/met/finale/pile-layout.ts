import { seededRandom } from "@/lib/graduation/seeded-random";

/**
 * Phone finale: memory photos in a loose pile above and below the pinned note. Each photo is as
 * large as the space allows while no photo hides more than `MAX_COVER` of another (or sits more than
 * that under the together photo), and photos reach over the note's frame but never its text.
 * Pure px geometry in viewport coordinates, so it can be checked with numbers.
 */

export type Rect = { x: number; y: number; w: number; h: number };

export type PileInput = {
  count: number;
  viewportW: number;
  viewportH: number;
  /** The grown note while pinned (viewport px). */
  note: Rect;
  /** Height (px) of a photo besides its square image: border, padding and the caption chin. */
  chrome: number;
  /** The together photo, which paints over the pile. */
  obstacle?: Rect;
};

/** Most of a photo another may cover… */
export const MAX_COVER = 0.7;
/** …though a roomier pile, covering at most this much, is preferred while photos stay at least `ROOMY_MIN_W` wide. */
const ROOMY_COVER = 0.5;
const ROOMY_MIN_W = 88;
/** Page header height (px) and the margin kept from it and from the screen edges. */
export const HEADER_PX = 65;
export const EDGE_PX = 8;
/** How far (px) photos may reach over the note's top and bottom frame; its text sits further in. */
export const NOTE_REACH_TOP_PX = 24;
export const NOTE_REACH_BOTTOM_PX = 12;
/** Photo width (px): as large as fits, between these. */
export const MAX_W = 128;
export const MIN_W = 72;
/** A photo may tuck this share of its width under the together photo's edge. */
const TUCK = 0.3;
/** Random offset from a photo's grid spot, as a share of the grid step. */
const JITTER = 0.22;
const SEED = 7;

export function coverage(a: Rect, b: Rect): number {
  const x = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const y = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return (x * y) / Math.min(a.w * a.h, b.w * b.h);
}

type Zone = { x0: number; x1: number; y0: number; y1: number };

const area = (z: Zone) => Math.max(0, z.x1 - z.x0) * Math.max(0, z.y1 - z.y0);

/** The free areas above and below the note; the top one stops short of a together photo that fills its height. */
function zones({ viewportW, viewportH, note, obstacle }: PileInput, w: number): [top: Zone, bottom: Zone] {
  const top: Zone = { x0: EDGE_PX, x1: viewportW - EDGE_PX, y0: HEADER_PX + EDGE_PX, y1: note.y + NOTE_REACH_TOP_PX };
  if (obstacle && obstacle.y < top.y1 && obstacle.y + obstacle.h > top.y0) {
    if (obstacle.x + obstacle.w / 2 > viewportW / 2) top.x1 = Math.min(top.x1, obstacle.x + w * TUCK);
    else top.x0 = Math.max(top.x0, obstacle.x + obstacle.w - w * TUCK);
  }
  const bottom: Zone = { x0: EDGE_PX, x1: viewportW - EDGE_PX, y0: note.y + note.h - NOTE_REACH_BOTTOM_PX, y1: viewportH - EDGE_PX };
  return [top, bottom];
}

/** `n` photos in a brick grid shaped like the zone, each nudged off its spot by `jitter`. */
function scatter(n: number, z: Zone, w: number, h: number, jitter: number, rnd: () => number): Rect[] {
  if (n === 0) return [];
  const zw = z.x1 - z.x0;
  const zh = z.y1 - z.y0;
  const cols = Math.min(n, Math.max(1, Math.round(Math.sqrt((n * Math.max(zw - w, 1)) / Math.max(zh - h, 1)) || 1)));
  const rows = Math.ceil(n / cols);
  const stepX = cols > 1 ? Math.max(0, zw - w) / (cols - 1 + (rows > 1 ? 0.5 : 0)) : 0;
  const stepY = rows > 1 ? Math.max(0, zh - h) / (rows - 1) : 0;
  return Array.from({ length: n }, (_, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const inRow = Math.min(cols, n - row * cols);
    const shift = rows > 1 && row % 2 === 1 ? stepX / 2 : 0;
    const centre = cols > 1 ? 0 : (zw - w) / 2;
    const lastRowPad = ((cols - inRow) * stepX) / 2;
    const x = z.x0 + centre + shift + lastRowPad + col * stepX + (rnd() - 0.5) * 2 * jitter * stepX;
    const y = z.y0 + row * stepY + (rnd() - 0.5) * 2 * jitter * stepY;
    return { x: Math.min(Math.max(x, z.x0), z.x1 - w), y: Math.min(Math.max(y, z.y0), Math.max(z.y0, z.y1 - h)), w, h };
  });
}

function worstCover(rects: Rect[], obstacle?: Rect): number {
  let worst = 0;
  rects.forEach((a, i) => {
    for (const b of rects.slice(i + 1)) worst = Math.max(worst, coverage(a, b));
    if (obstacle) worst = Math.max(worst, coverage(a, obstacle));
  });
  return worst;
}

/** Splits `count` photos between the zones by their area, alternating so each arriving group has photos above and below. */
function assign(count: number, [top, bottom]: [Zone, Zone]): ("top" | "bottom")[] {
  const share = area(top) / Math.max(1, area(top) + area(bottom));
  let placedTop = 0;
  return Array.from({ length: count }, (_, i) => {
    const wantTop = Math.round((i + 1) * share) > placedTop;
    if (wantTop) placedTop++;
    return wantTop ? "top" : "bottom";
  });
}

function layoutAt(input: PileInput, w: number, jitter: number): Rect[] {
  const h = w + input.chrome;
  const zs = zones(input, w);
  const sides = assign(input.count, zs);
  const rnd = seededRandom(SEED);
  const top = scatter(sides.filter((s) => s === "top").length, zs[0], w, h, jitter, rnd);
  const bottom = scatter(sides.filter((s) => s === "bottom").length, zs[1], w, h, jitter, rnd);
  let t = 0;
  let b = 0;
  return sides.map((s) => (s === "top" ? top[t++] : bottom[b++]));
}

/** The largest photos from `widest` down to `narrowest` whose covers all stay within `limit`. */
function fit(input: PileInput, widest: number, narrowest: number, limit: number): Rect[] | null {
  for (let w = widest; w >= narrowest; w -= 4) {
    for (const jitter of [JITTER, JITTER / 2, 0]) {
      const rects = layoutAt(input, w, jitter);
      if (worstCover(rects, input.obstacle) <= limit) return rects;
    }
  }
  return null;
}

/** Photo rects (viewport px) in arrival order: a roomy pile of large photos if one fits, else the largest within `MAX_COVER`. */
export function pileLayout(input: PileInput): Rect[] {
  if (input.count === 0) return [];
  const widest = Math.min(MAX_W, Math.round(input.viewportW * 0.32));
  return fit(input, widest, ROOMY_MIN_W, ROOMY_COVER) ?? fit(input, widest, MIN_W, MAX_COVER) ?? layoutAt(input, MIN_W, 0);
}
