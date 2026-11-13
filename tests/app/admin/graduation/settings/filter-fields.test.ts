import { describe, expect, it } from "vitest";
import { filterFields } from "@/app/admin/graduation/settings/fields/filter-fields";
import { COPY_FIELDS } from "@/lib/graduation/content/fields";

const keys = (query: string, extra: (key: string) => string[] = () => []) =>
  filterFields(COPY_FIELDS, query, (field) => extra(field.key)).map((field) => field.key);

describe("filterFields", () => {
  it("returns every field for a blank query", () => {
    expect(keys("  ")).toHaveLength(COPY_FIELDS.length);
  });
  it("matches labels without diacritics", () => {
    expect(keys("loi chao")).toContain("card.greeting");
  });
  it("matches keys", () => {
    expect(keys("rsvp.letter")).toEqual(["rsvp.letter.to", "rsvp.letter.from", "rsvp.letter.sent"]);
  });
  it("matches extra text such as current values", () => {
    expect(keys("Đà Lạt", (key) => (key === "met.intro" ? ["Chuyến đi Đà Lạt"] : []))).toEqual(["met.intro"]);
  });
});
