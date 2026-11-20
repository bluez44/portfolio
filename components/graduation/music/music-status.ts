import type { TrackState } from "./audio-track";

export type MusicStatus = "idle" | "loading" | "playing" | "paused" | "error";

const TRACK_TO_MUSIC: Record<TrackState, MusicStatus> = {
  loading: "loading",
  ready: "paused",
  playing: "playing",
  paused: "paused",
  error: "error",
};

export const toMusicStatus = (state: TrackState): MusicStatus => TRACK_TO_MUSIC[state];
