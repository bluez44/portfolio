import { describe, expect, it } from "vitest";
import { seamLayers } from "@/components/graduation/shared/seam-layers";

/** Splits a CSS layer list on its top-level commas. */
const split = (list: string) => {
  const parts = [""];
  let depth = 0;
  for (const ch of list) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) parts.push("");
    else parts[parts.length - 1] += ch;
  }
  return parts.map((p) => p.trim());
};

describe("seamLayers", () => {
  const layers = seamLayers(6, "var(--cell)", "var(--paper)");

  it("draws one row of dots per layer", () => {
    expect(split(layers.backgroundImage)).toHaveLength(6);
    expect(split(layers.backgroundSize)).toEqual(Array(6).fill("var(--cell) var(--cell)"));
    expect(split(layers.backgroundRepeat)).toEqual(Array(6).fill("repeat-x"));
  });

  it("shrinks the dots linearly from 45% of a cell at the top to nothing at the bottom", () => {
    const stops = split(layers.backgroundImage).map((l) => Number(l.match(/var\(--paper\) ([\d.]+)%/)![1]));
    expect(stops).toEqual([90, 72, 54, 36, 18, 0]);
  });

  it("stacks the rows a cell apart and shifts odd rows by half a cell", () => {
    expect(split(layers.backgroundPosition)).toEqual([
      "0 calc(var(--cell) * 0)",
      "calc(var(--cell) / 2) calc(var(--cell) * 1)",
      "0 calc(var(--cell) * 2)",
      "calc(var(--cell) / 2) calc(var(--cell) * 3)",
      "0 calc(var(--cell) * 4)",
      "calc(var(--cell) / 2) calc(var(--cell) * 5)",
    ]);
  });
});
