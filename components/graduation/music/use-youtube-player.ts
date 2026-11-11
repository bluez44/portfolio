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

  // Browsers block unmuted autoplay without a user gesture, and only
  // clicks/keys/taps grant one — a wheel scroll never does (Chrome even
  // pauses a muted-autoplaying video that unmutes without activation).
  // Strategy: try unmuted; if blocked, play muted (always allowed); on every
  // interaction attempt an unmute and verify 400ms later — a scroll attempt
  // that got policy-paused falls back to muted playback and keeps waiting
  // for a real activation gesture.
  const isPlaying = useRef(false);
  const mutedFallback = useRef(false);
  const mutedStartTimer = useRef<number | null>(null);
  const verifyTimer = useRef<number | null>(null);
  const disarmGesture = useRef<(() => void) | null>(null);

  const unmuteIfNeeded = useCallback(() => {
    if (!mutedFallback.current) return;
    mutedFallback.current = false;
    disarmGesture.current?.();
    playerRef.current?.unMute();
  }, []);

  const armGestureStart = useCallback(() => {
    if (disarmGesture.current) return;
    const start = () => {
      const p = playerRef.current;
      if (!p || verifyTimer.current != null) return;
      p.unMute();
      p.playVideo();
      verifyTimer.current = window.setTimeout(() => {
        verifyTimer.current = null;
        if (p.getPlayerState() === 1 && !p.isMuted()) {
          mutedFallback.current = false;
          disarmGesture.current?.();
        } else {
          // Policy rejected the unmute — keep the music rolling silently.
          mutedFallback.current = true;
          p.mute();
          p.playVideo();
        }
      }, 400);
    };
    GESTURE_EVENTS.forEach((ev) => window.addEventListener(ev, start, { passive: true }));
    disarmGesture.current = () => {
      GESTURE_EVENTS.forEach((ev) => window.removeEventListener(ev, start));
      disarmGesture.current = null;
    };
  }, []);
  useEffect(
    () => () => {
      disarmGesture.current?.();
      if (mutedStartTimer.current != null) window.clearTimeout(mutedStartTimer.current);
      if (verifyTimer.current != null) window.clearTimeout(verifyTimer.current);
    },
    [],
  );

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
              // If the unmuted attempt was blocked, restart muted shortly after.
              mutedStartTimer.current = window.setTimeout(() => {
                if (isPlaying.current) return;
                mutedFallback.current = true;
                e.target.mute();
                e.target.playVideo();
              }, 800);
              onReadyRef.current?.();
            },
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.PLAYING) {
                isPlaying.current = true;
                // Keep the gesture listeners while muted: they still need to unmute.
                if (!mutedFallback.current) disarmGesture.current?.();
                setStatus("playing");
              } else if (e.data === YT.PlayerState.PAUSED) {
                isPlaying.current = false;
                setStatus("paused");
              }
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
    unmuteIfNeeded();
    if (status === "playing") playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  }, [videoId, status, fail, unmuteIfNeeded]);

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
    unmuteIfNeeded();
    playerRef.current?.playVideo();
  }, [cancelFade, unmuteIfNeeded]);

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
    unmuteIfNeeded();
    p.setVolume(0);
    p.playVideo();
    runFade(0, FULL_VOLUME);
  }, [runFade, unmuteIfNeeded]);

  return { status, open, mountRef, toggle, close, pause, resume, fadePause, fadeResume };
}
