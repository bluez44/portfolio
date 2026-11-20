import { describe, expect, it } from "vitest";
import {
  eventSchema,
  imageUrlSchema,
  isoDateTimeSchema,
  mapEmbedUrlSchema,
  momentSchema,
  musicSchema,
  ownerSchema,
} from "@/lib/graduation/content/settings-rules";

describe("settings rules", () => {
  it("turns blank owner fields into undefined and trims the rest", () => {
    expect(ownerSchema.parse({ name: "  Vinh ", initials: "" })).toEqual({ name: "Vinh" });
  });
  it("caps initials", () => {
    expect(ownerSchema.safeParse({ initials: "ABCDE" }).success).toBe(false);
  });
  it("accepts site-relative and https images only", () => {
    expect(imageUrlSchema.safeParse("/me.jpg").success).toBe(true);
    expect(imageUrlSchema.safeParse("https://blob.vercel-storage.com/a.jpg").success).toBe(true);
    expect(imageUrlSchema.safeParse("http://x.com/a.jpg").success).toBe(false);
  });
  it("accepts ISO instants with milliseconds", () => {
    expect(isoDateTimeSchema.safeParse("2026-11-28T09:30:00.000Z").success).toBe(true);
    expect(isoDateTimeSchema.safeParse("28/11/2026").success).toBe(false);
  });
  it("validates audio track pathnames and ignores legacy youtube keys", () => {
    expect(eventSchema.safeParse({ musicTrack: "audio/underwater-city.mp3" }).success).toBe(true);
    expect(eventSchema.safeParse({ musicTrack: "hfavqkBrwXI" }).success).toBe(false);
    expect(eventSchema.parse({ musicYoutubeId: "hfavqkBrwXI" })).toEqual({});
    expect(musicSchema.safeParse({ track: "audio/other.mp3" }).success).toBe(true);
    expect(musicSchema.safeParse({ track: "invalid" }).success).toBe(false);
    expect(musicSchema.parse({ youtubeId: "hfavqkBrwXI" })).toEqual({});
  });
  it("requires a Google Maps embed link for the map", () => {
    expect(mapEmbedUrlSchema.safeParse("https://www.google.com/maps/embed?pb=1").success).toBe(true);
    expect(mapEmbedUrlSchema.safeParse("https://maps.app.goo.gl/x").success).toBe(false);
  });
  it("rejects non-https tour links", () => {
    expect(eventSchema.safeParse({ virtualTourUrl: "http://x" }).success).toBe(false);
  });
  it("lets a moment keep an empty image", () => {
    expect(momentSchema.parse({ year: "2024", image: "" })).toEqual({ year: "2024", image: "" });
  });
});
