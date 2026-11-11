"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadYouTubeIframeApi } from "@/lib/youtube/load-iframe-api";
import type { YTPlayer } from "@/lib/youtube/types";

export type MusicStatus = "idle" | "loading" | "playing" | "paused" | "error";

const FADE_MS = 1200;
const FULL_VOLUME = 100;
const GESTURE_EVENTS = ["pointerdown", "keydown", "touchstart", "wheel"] as const;

export function useYouTubePlayer(videoId: string, onError: () => void, autoStart = false, onReady?: () => void) {
  const [status, setStatus] = useState<MusicStatus>("idle");
  const [open, setOpen] = useState(false);
  const mountRef = useRef<HTMLDivElement | null>(null);
  // playerRef is only set once the player fires onReady, so its methods are safe to call.
  const playerRef = useRef<YTPlayer | null>(null);
  // instanceRef tracks the raw (possibly-not-ready) instance, so it can still be destroyed on unmount/retry.
  const instanceRef = useRef<YTPlayer | null>(null);
  const onErrorRef = useRef(onError);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onErrorRef.current = onError;
    onReadyRef.current = onReady;
  }, [onError, onReady]);

  // Browsers block unmuted autoplay without a user gesture, so the first
  // playVideo() attempt usually fails silently. Arm one-shot gesture
  // listeners that retry on the visitor's first interaction.
  const disarmGesture = useRef<(() => void) | null>(null);
  const armGestureStart = useCallback(() => {
    if (disarmGesture.current) return;
    const start = () => {
      disarmGesture.current?.();
      playerRef.current?.playVideo();
    };
    GESTURE_EVENTS.forEach((ev) => window.addEventListener(ev, start, { passive: true }));
    disarmGesture.current = () => {
      GESTURE_EVENTS.forEach((ev) => window.removeEventListener(ev, start));
      disarmGesture.current = null;
    };
  }, []);
  useEffect(() => () => disarmGesture.current?.(), []);

  // Volume fades run on rAF; any new fade/pause/resume cancels the previous one.
  const fadeFrame = useRef<number | null>(null);
  const cancelFade = useCallback(() => {
    if (fadeFrame.current != null) cancelAnimationFrame(fadeFrame.current);
    fadeFrame.current = null;
  }, []);
  useEffect(() => cancelFade, [cancelFade]);
  const runFade = useCallback(
    (from: number, to: number, onDone?: () => void) => {
      const p = playerRef.current;
      if (!p) return;
      cancelFade();
      const start = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / FADE_MS);
        p.setVolume(Math.round(from + (to - from) * k));
        if (k < 1) fadeFrame.current = requestAnimationFrame(step);
        else {
          fadeFrame.current = null;
          onDone?.();
        }
      };
      fadeFrame.current = requestAnimationFrame(step);
    },
    [cancelFade],
  );

  // Auto-start: kick off playback once on mount when autoStart is true.
  const autoStarted = useRef(false);
  useEffect(() => {
    if (!autoStart || autoStarted.current || !videoId) return;
    autoStarted.current = true;
    setStatus("loading");
    setOpen(true);
  }, [autoStart, videoId]);

  const fail = useCallback(() => {
    instanceRef.current?.destroy();
    instanceRef.current = null;
    playerRef.current = null;
    setStatus("error");
    setOpen(false);
    onErrorRef.current();
    // A failed player is still "done loading" for anyone awaiting readiness.
    onReadyRef.current?.();
  }, []);

  useEffect(() => {
    if (!open || instanceRef.current || !mountRef.current) return;
    let cancelled = false;
    const mount = mountRef.current;
    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled) return;
        instanceRef.current = new YT.Player(mount, {
          host: "https://www.youtube-nocookie.com",
          videoId,
          width: 200,
          height: 200,
          playerVars: { autoplay: 1, loop: 1, playlist: videoId, controls: 0, playsinline: 1, modestbranding: 1, rel: 0 },
          events: {
            onReady: (e) => {
              playerRef.current = e.target;
              e.target.playVideo();
              armGestureStart();
              onReadyRef.current?.();
            },
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.PLAYING) {
                disarmGesture.current?.();
                setStatus("playing");
              } else if (e.data === YT.PlayerState.PAUSED) setStatus("paused");
            },
            onError: fail,
          },
        });
      })
      .catch(() => !cancelled && fail());
    return () => {
      cancelled = true;
    };
  }, [open, videoId, fail, armGestureStart]);

  useEffect(() => () => instanceRef.current?.destroy(), []);

  // Pause when the tab becomes hidden; resume when it becomes visible again.
  useEffect(() => {
    const handleVisibility = () => {
      if (!playerRef.current) return;
      if (document.hidden) playerRef.current.pauseVideo();
      else playerRef.current.playVideo();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const toggle = useCallback(() => {
    if (!videoId) return fail();
    if (!playerRef.current) {
      setStatus("loading");
      setOpen(true);
      return;
    }
    setOpen(true);
    if (status === "playing") playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  }, [videoId, status, fail]);

  const close = useCallback(() => {
    playerRef.current?.pauseVideo();
    setOpen(false);
  }, []);

  const pause = useCallback(() => {
    cancelFade();
    playerRef.current?.pauseVideo();
  }, [cancelFade]);

  const resume = useCallback(() => {
    cancelFade();
    playerRef.current?.playVideo();
  }, [cancelFade]);

  /** Ramp the volume down, then pause (volume restored for the next play). */
  const fadePause = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    runFade(p.getVolume(), 0, () => {
      p.pauseVideo();
      p.setVolume(FULL_VOLUME);
    });
  }, [runFade]);

  /** Resume playback from silence and ramp the volume back up. */
  const fadeResume = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    p.setVolume(0);
    p.playVideo();
    runFade(0, FULL_VOLUME);
  }, [runFade]);

  return { status, open, mountRef, toggle, close, pause, resume, fadePause, fadeResume };
}
