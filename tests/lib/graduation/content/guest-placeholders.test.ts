import { describe, expect, it } from "vitest";
import { guestPlaceholders } from "@/lib/graduation/content/guest-placeholders";
import { GRADUATION_EVENT } from "@/lib/graduation/event";
import { DEFAULT_MOMENTS, DEFAULT_TEXTS } from "@/lib/graduation/i18n";

describe("guestPlaceholders", () => {
  it("shows the shared value per language, raw templates included", () => {
    const placeholders = guestPlaceholders({ copy: { vi: { "met.intro": "Chung" } } });
    expect(placeholders.texts.vi["met.intro"]).toBe("Chung");
    expect(placeholders.texts.en["met.intro"]).toBe(DEFAULT_TEXTS.en.met.intro);
    expect(placeholders.texts.vi["rsvp.prompt"]).toContain("{name}");
  });
  it("uses the shared memory cards and event time", () => {
    const placeholders = guestPlaceholders({ moments: [{ year: "2030", image: "", vi: { title: "Chung" } }] });
    expect(placeholders.moments.vi[0].title).toBe("Chung");
    expect(placeholders.moments.en[0].title).toBe(DEFAULT_MOMENTS.en[0].title);
    expect(placeholders.times).toEqual({ startUtc: GRADUATION_EVENT.startUtc, endUtc: GRADUATION_EVENT.endUtc });
  });
});
