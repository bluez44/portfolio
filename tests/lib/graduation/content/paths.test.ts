import { describe, expect, it } from "vitest";
import { getPath, leafKeys, setPath } from "@/lib/graduation/content/paths";
import { joinList, splitList } from "@/lib/graduation/content/list-format";

describe("getPath", () => {
  it("reads nested values", () => {
    expect(getPath({ a: { b: { c: "x" } } }, "a.b.c")).toBe("x");
  });
  it("returns undefined for missing branches", () => {
    expect(getPath({ a: "x" }, "a.b")).toBeUndefined();
  });
});

describe("setPath", () => {
  it("returns a new tree and keeps the original", () => {
    const original = { a: { b: "old", keep: "k" } };
    const next = setPath(original, "a.b", "new");
    expect(next).toEqual({ a: { b: "new", keep: "k" } });
    expect(original.a.b).toBe("old");
  });
  it("creates missing branches", () => {
    expect(setPath({}, "a.b", 1)).toEqual({ a: { b: 1 } });
  });
});

describe("leafKeys", () => {
  it("treats strings, arrays and functions as leaves", () => {
    const fn = () => "";
    expect(leafKeys({ a: "x", b: { c: ["1"], d: fn } })).toEqual(["a", "b.c", "b.d"]);
  });
});

describe("list format", () => {
  it("splits lines, trims and drops blanks", () => {
    expect(splitList(" A \n\n B\n")).toEqual(["A", "B"]);
  });
  it("joins with newlines", () => {
    expect(joinList(["A", "B"])).toBe("A\nB");
  });
});
