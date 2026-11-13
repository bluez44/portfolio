import { describe, expect, it } from "vitest";
import { layerTexts } from "@/lib/graduation/content/layer-texts";
import { DEFAULT_TEXTS } from "@/lib/graduation/i18n";

describe("layerTexts", () => {
  it("is the defaults without overrides", () => {
    expect(layerTexts("vi")).toEqual(DEFAULT_TEXTS.vi);
  });
  it("applies shared settings for the language only", () => {
    const settings = { copy: { vi: { "met.intro": "Chung VI" } } };
    expect(layerTexts("vi", settings).met.intro).toBe("Chung VI");
    expect(layerTexts("en", settings).met.intro).toBe(DEFAULT_TEXTS.en.met.intro);
  });
  it("lets the guest win over shared settings", () => {
    const texts = layerTexts("vi", { copy: { vi: { "card.greeting": "Chung" } } }, { vi: { "card.greeting": "Riêng" } });
    expect(texts.card.greeting).toBe("Riêng");
  });
  it("falls back to shared English when the guest English is blank", () => {
    const texts = layerTexts("en", { copy: { en: { "card.greeting": "Shared" } } }, { vi: { "card.greeting": "Riêng" }, en: { "card.greeting": "  " } });
    expect(texts.card.greeting).toBe("Shared");
  });
  it("ignores guest keys outside the guest list", () => {
    expect(layerTexts("vi", null, { vi: { "gate.tapBee": "x" } }).gate.tapBee).toBe(DEFAULT_TEXTS.vi.gate.tapBee);
  });
});
