import { describe, expect, it } from "vitest";
import { buildCopy } from "@/lib/graduation/content/build-copy";
import type { CopyField } from "@/lib/graduation/content/fields";

const fields: CopyField[] = [
  { key: "a.title", section: "misc", label: "t", kind: "text" },
  { key: "a.greet", section: "misc", label: "g", kind: "text", call: "name" },
  { key: "a.lines", section: "misc", label: "l", kind: "list" },
  { key: "a.extra", section: "misc", label: "e", kind: "textarea", optional: true },
];

describe("buildCopy", () => {
  const texts = { a: { title: "Năm {year}", greet: "Chào {name}, {year}", lines: ["{date}", "x"], extra: "" }, other: "keep" };
  const built = buildCopy(texts, fields, { year: "2026", date: "28.11" }) as {
    a: { title: string; greet: (name: string) => string; lines: string[]; extra?: string };
    other: string;
  };

  it("fills static tokens", () => {
    expect(built.a.title).toBe("Năm 2026");
  });
  it("turns call fields into functions", () => {
    expect(built.a.greet("Lan")).toBe("Chào Lan, 2026");
  });
  it("fills each list item", () => {
    expect(built.a.lines).toEqual(["28.11", "x"]);
  });
  it("drops blank optional fields", () => {
    expect(built.a.extra).toBeUndefined();
  });
  it("keeps keys that are not fields", () => {
    expect(built.other).toBe("keep");
  });
});
