import { describe, expect, it } from "vitest";
import { applyOverrides } from "@/lib/graduation/content/apply-overrides";
import type { CopyField } from "@/lib/graduation/content/fields";
import { DEFAULT_TEXTS } from "@/lib/graduation/i18n";

const base = DEFAULT_TEXTS.vi;

describe("applyOverrides", () => {
  it("returns the same texts when there is nothing to apply", () => {
    expect(applyOverrides(base, undefined)).toBe(base);
  });
  it("replaces a nested string", () => {
    expect(applyOverrides(base, { "met.intro": "Mới" }).met.intro).toBe("Mới");
  });
  it("trims values", () => {
    expect(applyOverrides(base, { "met.intro": "  Mới  " }).met.intro).toBe("Mới");
  });
  it("ignores blank and whitespace-only values", () => {
    expect(applyOverrides(base, { "met.intro": "   " }).met.intro).toBe(base.met.intro);
  });
  it("splits list fields by line", () => {
    expect(applyOverrides(base, { "ends.notes": "A\n\nB" }).ends.notes).toEqual(["A", "B"]);
  });
  it("ignores a list made only of blank lines", () => {
    expect(applyOverrides(base, { "ends.notes": "\n \n" }).ends.notes).toEqual(base.ends.notes);
  });
  it("ignores keys that are not fields", () => {
    expect(applyOverrides(base, { "met.moments": "x", nope: "y" })).toEqual(base);
  });
  it("only applies the given fields", () => {
    const onlyIntro: CopyField[] = [{ key: "met.intro", section: "met", label: "", kind: "text" }];
    const result = applyOverrides(base, { "met.intro": "A", "card.body": "B" }, onlyIntro);
    expect(result.met.intro).toBe("A");
    expect(result.card.body).toBe(base.card.body);
  });
  it("does not mutate the defaults", () => {
    applyOverrides(base, { "met.intro": "Mới" });
    expect(DEFAULT_TEXTS.vi.met.intro).not.toBe("Mới");
  });
});
