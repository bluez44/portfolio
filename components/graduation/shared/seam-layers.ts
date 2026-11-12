/** Dot radius of the top row, as a share of the gradient's closest side (half a cell): 45% of a cell. */
const TOP_STOP = 90;
const EDGE_SOFTNESS = 4;

/**
 * One repeat-x radial-gradient layer per row of a halftone fade: dots shrink linearly from the top
 * row to nothing at the bottom, and odd rows sit half a cell over. `cell` is any CSS length.
 */
export function seamLayers(rows: number, cell: string, color: string) {
  const indices = Array.from({ length: rows }, (_, r) => r);
  const stop = (r: number) => (TOP_STOP * (rows - 1 - r)) / (rows - 1);
  return {
    backgroundImage: indices
      .map((r) => `radial-gradient(circle closest-side, ${color} ${stop(r)}%, transparent ${stop(r) && stop(r) + EDGE_SOFTNESS}%)`)
      .join(", "),
    backgroundSize: indices.map(() => `${cell} ${cell}`).join(", "),
    backgroundPosition: indices.map((r) => `${r % 2 ? `calc(${cell} / 2)` : "0"} calc(${cell} * ${r})`).join(", "),
    backgroundRepeat: indices.map(() => "repeat-x").join(", "),
  };
}
