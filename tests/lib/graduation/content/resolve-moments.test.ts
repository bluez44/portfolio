import { describe, expect, it } from "vitest";
import { resolveMoments } from "@/lib/graduation/content/resolve-moments";
import { DEFAULT_MOMENTS } from "@/lib/graduation/i18n";

const defaults = DEFAULT_MOMENTS.en;

describe("resolveMoments", () => {
  it("returns the defaults when nobody customised the list", () => {
    expect(resolveMoments({ lang: "en", defaults })).toEqual(defaults);
  });
  it("uses the shared list over the defaults", () => {
    const result = resolveMoments({ lang: "en", defaults, settings: [{ year: "2030", image: "/x.jpg", en: { title: "T", body: "B" } }] });
    expect(result).toEqual([{ n: "01", year: "2030", title: "T", body: "B", image: "/x.jpg", color: "tomato", rot: -1.6 }]);
  });
  it("uses the guest list over the shared list", () => {
    const result = resolveMoments({
      lang: "en",
      defaults,
      settings: [{ year: "2030", image: "/x.jpg", en: { title: "Shared" } }],
      guest: [{ year: "2031", image: "", color: "jade", en: { title: "Guest" } }],
    });
    expect(result[0]).toMatchObject({ year: "2031", title: "Guest", color: "jade", image: defaults[0].image });
  });
  it("fills a blank English text from the shared list, then the defaults, never from Vietnamese", () => {
    const result = resolveMoments({
      lang: "en",
      defaults,
      settings: [{ year: "2030", image: "", en: { title: "Shared EN" } }],
      guest: [{ year: "2031", image: "", vi: { title: "Riêng", body: "Thân" } }],
    });
    expect(result[0].title).toBe("Shared EN");
    expect(result[0].body).toBe(defaults[0].body);
  });
  it("leaves text empty past the end of every fallback", () => {
    const guest = Array.from({ length: 6 }, (_, i) => ({ year: String(2020 + i), image: "" }));
    const result = resolveMoments({ lang: "vi", defaults: DEFAULT_MOMENTS.vi, guest });
    expect(result[5]).toMatchObject({ n: "06", title: "", body: "", image: "", color: "blue", rot: 1.4 });
  });
});
