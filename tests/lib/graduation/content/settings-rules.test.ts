import { describe, expect, it } from "vitest";
import {
  eventSchema,
  imageUrlSchema,
  isoDateTimeSchema,
  mapEmbedUrlSchema,
  momentSchema,
  ownerSchema,
  youtubeIdSchema,
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
  it("requires an 11-character YouTube id", () => {
    expect(youtubeIdSchema.safeParse("hfavqkBrwXI").success).toBe(true);
    expect(youtubeIdSchema.safeParse("https://youtu.be/hfavqkBrwXI").success).toBe(false);
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
