"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadYouTubeIframeApi } from "@/lib/youtube/load-iframe-api";
import type { YTPlayer } from "@/lib/youtube/types";

export type MusicStatus = "idle" | "loading" | "playing" | "paused" | "error";

export function useYouTubePlayer(videoId: string, onError: () => void) {
  const [status, setStatus] = useState<MusicStatus>("idle");
  const [open, setOpen] = useState(false);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const fail = useCallback(() => {
    setStatus("error");
    setOpen(false);
    onErrorRef.current();
  }, []);

  useEffect(() => {
    if (!open || playerRef.current || !mountRef.current) return;
    let cancelled = false;
    const mount = mountRef.current;
    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled) return;
        playerRef.current = new YT.Player(mount, {
          host: "https://www.youtube-nocookie.com",
          videoId,
          width: 200,
          height: 200,
          playerVars: { autoplay: 1, loop: 1, playlist: videoId, controls: 0, playsinline: 1, modestbranding: 1, rel: 0 },
          events: {
            onReady: (e) => e.target.playVideo(),
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
    };
  }, [open, videoId, fail]);

  useEffect(() => () => playerRef.current?.destroy(), []);

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

  return { status, open, mountRef, toggle, close };
}
