"use client";

import { useEffect, useState } from "react";
import LoadingCat from "@/public/lottie/Bad Cat.svg";
import Image from "next/image";

const READY_TIMEOUT_MS = 8000;

export function SceneLoadingGate() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const markReady = () => {
      if (!cancelled) setReady(true);
    };

    const timeout = window.setTimeout(markReady, READY_TIMEOUT_MS);

    // Warms the same dynamic-import chunks next/dynamic uses inside
    // Hero/Skills (identical specifiers, so the bundler dedupes the
    // network fetch) without ever mounting the heavy WebGL scenes here.
    Promise.all([import("./hero-scene"), import("./tech-scene")])
      .catch(() => {
        // A failed chunk fetch shouldn't permanently block the whole site —
        // reveal it and let each scene's own CanvasErrorBoundary handle the
        // failure locally when it actually mounts.
      })
      .finally(() => {
        window.clearTimeout(timeout);
        markReady();
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      id="scene-loading-overlay"
      aria-hidden={ready}
      className={`fixed inset-0 z-100 flex flex-col items-center justify-center gap-3 bg-bg transition-opacity duration-500 ${
        ready ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <Image
        src={LoadingCat}
        alt="Loading cat"
        width={200}
        height={200}
        className="animate-spin-slow"
      />
      <div className="flex items-center gap-1">
        <span
          aria-hidden
          className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_10px_var(--glow)]"
          style={{ animation: "pulse-dot 1.4s ease-in-out infinite" }}
        />
        <p className="font-mono text-[12px] tracking-[0.18em] text-muted uppercase">
          Loading experience
        </p>
      </div>
      <noscript>
        <style>{"#scene-loading-overlay{display:none}"}</style>
      </noscript>
    </div>
  );
}
