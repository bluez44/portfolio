"use client";

import { useEffect, useState } from "react";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

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

  return <LoadingOverlay ready={ready} />;
}
