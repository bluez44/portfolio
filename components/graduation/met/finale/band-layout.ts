import { ARRIVE_AT } from "./constants";

/**
 * Phone finale: photos in rows above and below the pinned note instead of a ring around it. Each
 * photo is as large as its band allows while neighbours overlap by at most `OVERLAP` of a photo,
 * and photos reach over the note's frame but never its text. Lengths are CSS so the band below
 * follows the grown note's real height (`--note-h`, set by `setNoteHeight`).
 */

/** Most of a photo a neighbour may cover, along either axis. */
export const OVERLAP = 0.2;
export const MAX_COLUMNS = 5;
/** Share of the viewport width the columns span, centred. */
export const SPAN_VW = 94;
/** Page header height (px) and the margin kept from it and from the bottom edge. */
const HEADER_PX = 65;
const EDGE_PX = 8;
/** How far (px) photos may reach over the note's top and bottom frame; its text sits further in. */
export const NOTE_REACH_TOP_PX = 24;
export const NOTE_REACH_BOTTOM_PX = 12;
/** Height (px) of a photo besides its square image: border, padding and the caption chin. */
export const CHROME_PX = 38;

/** Rows and columns for `count` photos: as few rows as possible, then as few columns. */
export function bandGrid(count: number): { rows: number; columns: number } {
  const rows = Math.max(1, Math.ceil(count / MAX_COLUMNS));
  return { rows, columns: Math.max(1, Math.ceil(count / rows)) };
}

/** Largest extent along an axis for `n` items that fit `length` overlapping by at most `OVERLAP`. */
export const itemExtent = (length: number, n: number): number => length / (1 + (n - 1) * (1 - OVERLAP));

/** A band's vertical extent relative to the note's top edge, as CSS lengths. */
type Band = { start: string; height: string };

const TOP: Band = {
  start: `calc(${HEADER_PX + EDGE_PX}px - ${ARRIVE_AT * 100}vh)`,
  height: `calc(${ARRIVE_AT * 100}vh - ${HEADER_PX + EDGE_PX - NOTE_REACH_TOP_PX}px)`,
};
const BOTTOM: Band = {
  start: `calc(var(--note-h, 30vh) - ${NOTE_REACH_BOTTOM_PX}px)`,
  height: `calc(${(1 - ARRIVE_AT) * 100}vh - var(--note-h, 30vh) + ${NOTE_REACH_BOTTOM_PX - EDGE_PX}px)`,
};

export type BandSpot = {
  /** Centre, vw from the viewport centre. */
  x: number;
  /** Top edge relative to the note's top edge (CSS length). */
  top: string;
  width: string;
  /** Stacking order: upper rows paint over lower ones so every caption stays visible. */
  layer: number;
};

function bandSpots(count: number, { start, height }: Band): BandSpot[] {
  if (count === 0) return [];
  const { rows, columns } = bandGrid(count);
  const rowHeight = `(${height}) / ${(1 + (rows - 1) * (1 - OVERLAP)).toFixed(4)}`;
  const columnWidth = itemExtent(SPAN_VW, columns);
  const width = `min(${columnWidth.toFixed(2)}vw, calc(${rowHeight} - ${CHROME_PX}px))`;
  const stepX = columnWidth * (1 - OVERLAP);
  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / columns);
    const inRow = row === rows - 1 ? count - row * columns : columns;
    const col = i % columns;
    return {
      x: (col - (inRow - 1) / 2) * stepX,
      top: `calc(${start} + ${row} * ${rowHeight} * ${1 - OVERLAP})`,
      width,
      layer: rows - row,
    };
  });
}

/** Spots for `count` photos; they alternate between the bands, so photos appear above and below in turn. */
export function bandLayout(count: number): BandSpot[] {
  const top = bandSpots(Math.ceil(count / 2), TOP);
  const bottom = bandSpots(Math.floor(count / 2), BOTTOM);
  return Array.from({ length: count }, (_, i) => (i % 2 === 0 ? top[i / 2] : bottom[(i - 1) / 2]));
}
