"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadYouTubeIframeApi } from "@/lib/youtube/load-iframe-api";
import type { YTPlayer } from "@/lib/youtube/types";
import { playbackRefused, YT_PLAYING } from "./playback-state";

export type MusicStatus = "idle" | "loading" | "playing" | "paused" | "error";

const FADE_MS = 1200;
const FULL_VOLUME = 100;
/** Still not started this long after a gesture means the browser refused it (iOS Safari can). */
const START_CHECK_MS = 1500;

/**
 * Background track in a hidden YouTube iframe. Browsers only allow audible playback from a user
 * activation, so `start` and `toggle` must run synchronously inside a click or key handler.
 */
export function useYouTubePlayer(videoId: string, onError: () => void, onReady?: () => void) {
  const [status, setStatus] = useState<MusicStatus>(videoId ? "loading" : "idle");
  const mountRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  // getVolume() lags behind setVolume() over postMessage, so fades track the level themselves.
  const volume = useRef(FULL_VOLUME);
  const wantsPlay = useRef(false);
  const resumeAfterDuck = useRef(false);
  const fadeFrame = useRef<number | null>(null);
  const startCheck = useRef<number | undefined>(undefined);
  const onErrorRef = useRef(onError);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onErrorRef.current = onError;
    onReadyRef.current = onReady;
  }, [onError, onReady]);

  const cancelFade = useCallback(() => {
    if (fadeFrame.current != null) cancelAnimationFrame(fadeFrame.current);
    fadeFrame.current = null;
  }, []);

  const setVolume = useCallback((p: YTPlayer, v: number) => {
    volume.current = v;
    p.setVolume(v);
  }, []);

  /** Ramp the volume to `to` (0–100); a later fade cancels this one. */
  const fadeTo = useCallback(
    (to: number, ms = FADE_MS, onDone?: () => void) => {
      const p = playerRef.current;
      if (!p) return;
      cancelFade();
      const from = volume.current;
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / ms);
        setVolume(p, Math.round(from + (to - from) * k));
        if (k < 1) fadeFrame.current = requestAnimationFrame(step);
        else {
          fadeFrame.current = null;
          onDone?.();
        }
      };
      fadeFrame.current = requestAnimationFrame(step);
    },
    [cancelFade, setVolume],
  );

  const begin = useCallback(
    (p: YTPlayer) => {
      wantsPlay.current = false;
      resumeAfterDuck.current = false;
      p.unMute();
      setVolume(p, 0);
      p.playVideo();
      fadeTo(FULL_VOLUME);
      window.clearTimeout(startCheck.current);
      startCheck.current = window.setTimeout(() => {
        if (playbackRefused(p.getPlayerState())) onErrorRef.current();
      }, START_CHECK_MS);
    },
    [fadeTo, setVolume],
  );

  const fail = useCallback(() => {
    playerRef.current = null;
    setStatus("error");
    onErrorRef.current();
    // A failed player is still "done loading" for anyone awaiting readiness.
    onReadyRef.current?.();
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!videoId || !mount) return;
    let cancelled = false;
    let instance: YTPlayer | null = null;
    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled) return;
        instance = new YT.Player(mount, {
          host: "https://www.youtube-nocookie.com",
          videoId,
          width: 200,
          height: 200,
          playerVars: { autoplay: 0, loop: 1, playlist: videoId, controls: 0, playsinline: 1, modestbranding: 1, rel: 0 },
          events: {
            onReady: (e) => {
              playerRef.current = e.target;
              setStatus("paused");
              if (wantsPlay.current) begin(e.target);
              onReadyRef.current?.();
            },
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.PLAYING) setStatus("playing");
              else if (e.data === YT.PlayerState.PAUSED) setStatus("paused");
            },
            onError: fail,
          },
        });
      })
      .catch(() => !cancelled && fail());
    return () => {
      cancelled = true;
      cancelFade();
      window.clearTimeout(startCheck.current);
      instance?.destroy();
      playerRef.current = null;
    };
  }, [videoId, begin, fail, cancelFade]);

  useEffect(() => {
    let resume = false;
    const onVisibility = () => {
      const p = playerRef.current;
      if (!p) return;
      if (document.hidden) {
        resume = p.getPlayerState() === YT_PLAYING;
        if (resume) p.pauseVideo();
      } else if (resume) p.playVideo();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const start = useCallback(() => {
    const p = playerRef.current;
    if (p) begin(p);
    else wantsPlay.current = true;
  }, [begin]);

  const toggle = useCallback(() => {
    resumeAfterDuck.current = false;
    const p = playerRef.current;
    if (!p) {
      if (status === "loading") wantsPlay.current = true;
      else onErrorRef.current();
      return;
    }
    if (status === "playing") {
      cancelFade();
      p.pauseVideo();
    } else begin(p);
  }, [status, begin, cancelFade]);

  const fadePause = useCallback(() => {
    const p = playerRef.current;
    resumeAfterDuck.current = p?.getPlayerState() === YT_PLAYING;
    if (resumeAfterDuck.current) fadeTo(0, FADE_MS, () => p?.pauseVideo());
  }, [fadeTo]);

  const fadeResume = useCallback(() => {
    const p = playerRef.current;
    if (!p || !resumeAfterDuck.current) return;
    resumeAfterDuck.current = false;
    p.playVideo();
    fadeTo(FULL_VOLUME);
  }, [fadeTo]);

  return { status, mountRef, start, toggle, fadeTo, fadePause, fadeResume };
}
