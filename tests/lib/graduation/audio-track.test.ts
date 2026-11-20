import { describe, expect, it } from "vitest";
import {
  DEFAULT_TRACK,
  audioUrl,
  isAudioPathname,
  trackPathnameSchema,
} from "@/lib/graduation/audio-track";

describe("audio track pathname and url rules", () => {
  it("validates audio pathnames", () => {
    expect(isAudioPathname("audio/underwater-city.mp3")).toBe(true);
    expect(isAudioPathname("audio/a.m4a")).toBe(true);
    expect(isAudioPathname("graduation/1-photo.jpg")).toBe(false);
    expect(isAudioPathname("audio/../secret.mp3")).toBe(false);
    expect(isAudioPathname("/audio/x.mp3")).toBe(false);
  });

  it("exposes default track", () => {
    expect(DEFAULT_TRACK).toBe("audio/underwater-city.mp3");
    expect(isAudioPathname(DEFAULT_TRACK)).toBe(true);
  });

  it("builds proxy audio url with encoded pathname", () => {
    expect(audioUrl("audio/underwater-city.mp3")).toBe(
      "/api/graduation/audio?pathname=audio%2Funderwater-city.mp3",
    );
  });

  it("validates track pathname via zod schema", () => {
    expect(trackPathnameSchema.safeParse("audio/underwater-city.mp3").success).toBe(true);
    expect(trackPathnameSchema.safeParse("audio/a.m4a").success).toBe(true);

    const invalid = trackPathnameSchema.safeParse("graduation/1-photo.jpg");
    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(invalid.error.issues[0]?.message).toBe("Đường dẫn phải dạng audio/ten-file.mp3");
    }
  });
});
