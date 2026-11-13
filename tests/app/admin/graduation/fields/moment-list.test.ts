import { describe, expect, it } from "vitest";
import {
  addMoment,
  momentsFromResolved,
  moveMoment,
  removeMoment,
  setMomentText,
  updateMoment,
} from "@/app/admin/graduation/components/fields/moment-list";
import { DEFAULT_MOMENTS } from "@/lib/graduation/i18n";

const a = { year: "1", image: "" };
const b = { year: "2", image: "" };

describe("moment list", () => {
  it("adds an empty moment", () => {
    expect(addMoment([a])).toEqual([a, { year: "", image: "" }]);
  });
  it("removes by index", () => {
    expect(removeMoment([a, b], 0)).toEqual([b]);
  });
  it("moves within bounds only", () => {
    expect(moveMoment([a, b], 0, 1)).toEqual([b, a]);
    expect(moveMoment([a, b], 0, -1)).toEqual([a, b]);
  });
  it("patches one moment", () => {
    expect(updateMoment([a, b], 1, { year: "3" })).toEqual([a, { year: "3", image: "" }]);
  });
  it("sets and clears localized text", () => {
    const withTitle = setMomentText(a, "en", "title", "Hi");
    expect(withTitle.en).toEqual({ title: "Hi" });
    expect(setMomentText(withTitle, "en", "title", "").en).toEqual({});
  });
  it("copies resolved moments into an editable list", () => {
    const list = momentsFromResolved(DEFAULT_MOMENTS);
    expect(list).toHaveLength(DEFAULT_MOMENTS.vi.length);
    expect(list[0]).toEqual({
      year: DEFAULT_MOMENTS.vi[0].year,
      image: DEFAULT_MOMENTS.vi[0].image,
      color: DEFAULT_MOMENTS.vi[0].color,
      vi: { title: DEFAULT_MOMENTS.vi[0].title, body: DEFAULT_MOMENTS.vi[0].body },
      en: { title: DEFAULT_MOMENTS.en[0].title, body: DEFAULT_MOMENTS.en[0].body },
    });
  });
});
