import { describe, expect, it } from "vitest";
import { resolveImages } from "@/lib/graduation/content/resolve-images";

describe("resolveImages", () => {
  it("uses the default badge and no photos by default", () => {
    expect(resolveImages(undefined, undefined)).toEqual({ badgeLogo: "/01_logobachkhoatoi.webp" });
  });
  it("lets the guest override the shared photos", () => {
    expect(resolveImages({ coverImage: "/a.jpg", togetherPhoto: "/b.jpg", badgeLogo: "/l.png" }, { coverImage: "/g.jpg" })).toEqual({
      coverImage: "/g.jpg",
      togetherPhoto: "/b.jpg",
      badgeLogo: "/l.png",
    });
  });
  it("takes the together focus from whichever photo is shown", () => {
    const settings = { togetherPhoto: "/b.jpg", togetherFocus: { wide: "top" as const } };
    expect(resolveImages(settings, { togetherFocus: { wide: "left" } }).togetherFocus).toEqual({ wide: "top" });
    expect(resolveImages(settings, { togetherPhoto: "/g.jpg" }).togetherFocus).toBeUndefined();
    expect(resolveImages(settings, { togetherPhoto: "/g.jpg", togetherFocus: { phone: "bottom" } }).togetherFocus).toEqual({ phone: "bottom" });
  });
});
