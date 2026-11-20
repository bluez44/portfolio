"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { audioUrl } from "@/lib/graduation/audio-track";
import { createGainTrack, type AudioTrack } from "./audio-track";
import { toMusicStatus, type MusicStatus } from "./music-status";

const FADE_MS = 1200;
const FULL_VOLUME = 100;
const MEDIA_TITLE = "Underwater City";

function setMediaMetadata() {
  if (
    typeof navigator !== "undefined" &&
    "mediaSession" in navigator &&
    typeof MediaMetadata !== "undefined"
  ) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: MEDIA_TITLE });
  }
}

export function useAudioPlayer(
  pathname: string,
  onError: () => void,
  onReady?: () => void,
  createTrack: (src: string) => AudioTrack = createGainTrack,
) {
  const [trackState, setTrackState] = useState<{ pathname: string; status: MusicStatus }>({
    pathname,
    status: "loading",
  });
  const status: MusicStatus = !pathname
    ? "idle"
    : trackState.pathname === pathname
      ? trackState.status
      : "loading";

  const trackRef = useRef<AudioTrack | null>(null);
  const resumeAfterDuck = useRef(false);
  const onErrorRef = useRef(onError);
  const onReadyRef = useRef(onReady);
  const createTrackRef = useRef(createTrack);

  useEffect(() => {
    onErrorRef.current = onError;
    onReadyRef.current = onReady;
    createTrackRef.current = createTrack;
  }, [onError, onReady, createTrack]);

  const fadeTo = useCallback((volume: number, ms = FADE_MS, onDone?: () => void) => {
    trackRef.current?.fadeTo(volume / FULL_VOLUME, ms, onDone);
  }, []);

  const begin = useCallback((track: AudioTrack) => {
    resumeAfterDuck.current = false;
    track.setLevel(0);
    setMediaMetadata();
    // play() must run synchronously inside the user gesture before any await.
    track.play().catch(() => {
      if (trackRef.current === track) onErrorRef.current();
    });
    track.fadeTo(1, FADE_MS);
  }, []);

  useEffect(() => {
    if (!pathname) return;
    const track = createTrackRef.current(audioUrl(pathname));
    trackRef.current = track;

    const unsubscribe = track.subscribe((state) => {
      setTrackState({ pathname, status: toMusicStatus(state) });
      if (state === "error") {
        trackRef.current = null;
        onErrorRef.current();
      }
    });

    onReadyRef.current?.();

    return () => {
      unsubscribe();
      track.dispose();
      trackRef.current = null;
    };
  }, [pathname]);

  useEffect(() => {
    let resume = false;
    const onVisibility = () => {
      const track = trackRef.current;
      if (!track) return;
      if (document.hidden) {
        resume = track.playing;
        if (resume) track.pause();
      } else if (resume) {
        resume = false;
        track.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const start = useCallback(() => {
    const track = trackRef.current;
    if (track) begin(track);
  }, [begin]);

  const toggle = useCallback(() => {
    resumeAfterDuck.current = false;
    const track = trackRef.current;
    if (!track) {
      onErrorRef.current();
      return;
    }
    if (track.playing) track.pause();
    else begin(track);
  }, [begin]);

  const fadePause = useCallback(() => {
    const track = trackRef.current;
    resumeAfterDuck.current = Boolean(track?.playing);
    if (track && resumeAfterDuck.current) {
      track.fadeTo(0, FADE_MS, () => track.pause());
    }
  }, []);

  const fadeResume = useCallback(() => {
    const track = trackRef.current;
    if (!track || !resumeAfterDuck.current) return;
    resumeAfterDuck.current = false;
    track.play().catch(() => {
      if (trackRef.current === track) onErrorRef.current();
    });
    track.fadeTo(1, FADE_MS);
  }, []);

  return { status, start, toggle, fadeTo, fadePause, fadeResume };
}
