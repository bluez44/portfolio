import type { Range } from "./constants";

/**
 * Phone finale: photos in rows above and below the pinned note instead of a ring around it, so each
 * one stays clear of the others and of the note and can be tapped.
 */

/** Rows above the note: below the page header, clear of the docked badge on the note's top edge. */
export const TOP_BAND: Range = [0.1, 0.34];
/** Rows below the grown note (it is about 0.3 of the viewport tall from `ARRIVE_AT`). */
export const BOTTOM_BAND: Range = [0.72, 0.985];
export const BAND_COLUMNS = 5;
/** Share of the viewport width the columns span, centred. */
const SPAN_VW = 94;
/** Space (vw) kept between neighbouring photos in a row. */
const GUTTER_VW = 2.5;
/** Height (px) of a photo besides its square image: border, padding and the gap to the next row. */
const FRAME_PX = 22;

export type BandSpot = { x: number; rest: number; width: string };

/** Rows of `count` items, `columns` per row; the last row is centred. Returns each item's column offset and row. */
function grid(count: number, columns: number): { col: number; row: number }[] {
  const rows = Math.ceil(count / columns);
  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / columns);
    const inRow = row === rows - 1 ? count - row * columns : columns;
    return { col: (i % columns) + (columns - inRow) / 2, row };
  });
}

function bandSpots(count: number, [from, to]: Range): BandSpot[] {
  if (count === 0) return [];
  const rows = Math.ceil(count / BAND_COLUMNS);
  const pitch = (to - from) / rows;
  const cell = SPAN_VW / BAND_COLUMNS;
  const width = `min(${(cell - GUTTER_VW).toFixed(2)}vw, calc(${(pitch * 100).toFixed(2)}vh - ${FRAME_PX}px))`;
  return grid(count, BAND_COLUMNS).map(({ col, row }) => ({
    x: -SPAN_VW / 2 + cell * (col + 0.5),
    rest: from + row * pitch,
    width,
  }));
}

/**
 * Spots for `count` photos (`x` vw from the viewport centre, `rest` top edge as a share of the
 * viewport height). Items alternate between the bands, so photos appear above and below in turn.
 */
export function bandLayout(count: number): BandSpot[] {
  const top = bandSpots(Math.ceil(count / 2), TOP_BAND);
  const bottom = bandSpots(Math.floor(count / 2), BOTTOM_BAND);
  return Array.from({ length: count }, (_, i) => (i % 2 === 0 ? top[i / 2] : bottom[(i - 1) / 2]));
}
