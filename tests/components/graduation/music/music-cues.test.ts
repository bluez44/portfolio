import { describe, expect, it } from "vitest";
import { BASE_VOLUME, MUSIC_CUES, volumeFor, type CueId } from "@/components/graduation/music/music-cues";

describe("volumeFor", () => {
  it("returns BASE_VOLUME when no cues are active", () => {
    expect(volumeFor(new Set())).toBe(BASE_VOLUME);
  });

  it("returns chapter-dip volume when only chapter-dip is active", () => {
    expect(volumeFor(new Set<CueId>(["chapter-dip"]))).toBe(MUSIC_CUES["chapter-dip"].volume);
  });

  it("returns writing volume when only writing is active", () => {
    expect(volumeFor(new Set<CueId>(["writing"]))).toBe(MUSIC_CUES.writing.volume);
  });

  it("returns finale-swell volume when only finale-swell is active", () => {
    expect(volumeFor(new Set<CueId>(["finale-swell"]))).toBe(MUSIC_CUES["finale-swell"].volume);
  });

  it("prioritizes writing over chapter-dip", () => {
    expect(volumeFor(new Set<CueId>(["chapter-dip", "writing"]))).toBe(MUSIC_CUES.writing.volume);
  });

  it("prioritizes finale-swell over writing and chapter-dip", () => {
    expect(volumeFor(new Set<CueId>(["chapter-dip", "writing", "finale-swell"]))).toBe(
      MUSIC_CUES["finale-swell"].volume,
    );
  });

  it("ignores unrecognized cue ids safely", () => {
    expect(volumeFor(new Set(["unknown" as CueId]))).toBe(BASE_VOLUME);
  });
});
