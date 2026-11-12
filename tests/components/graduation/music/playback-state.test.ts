import { describe, expect, it } from "vitest";
import { playbackRefused } from "@/components/graduation/music/playback-state";

describe("playbackRefused", () => {
  it("accepts a track that is playing", () => {
    expect(playbackRefused(1)).toBe(false);
  });
  it("accepts a track still buffering on a slow network", () => {
    expect(playbackRefused(3)).toBe(false);
  });
  it("flags a track that stayed unstarted, cued or paused", () => {
    expect(playbackRefused(-1)).toBe(true);
    expect(playbackRefused(5)).toBe(true);
    expect(playbackRefused(2)).toBe(true);
  });
});
