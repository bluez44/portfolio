import { describe, expect, it } from "vitest";
import { COPY_FIELDS } from "@/lib/graduation/content/fields";
import { flattenTexts } from "@/lib/graduation/content/flatten-texts";
import { DEFAULT_TEXTS } from "@/lib/graduation/i18n";

describe("flattenTexts", () => {
  const flat = flattenTexts(DEFAULT_TEXTS.vi);
  it("has one entry per field", () => {
    expect(Object.keys(flat).sort()).toEqual(COPY_FIELDS.map((field) => field.key).sort());
  });
  it("keeps templates raw", () => {
    expect(flat["met.andYou"]).toBe("Và bạn, {name}");
  });
  it("joins lists by line", () => {
    expect(flat["ends.stamp"]).toBe("Vé mời\nKhách");
  });
});
