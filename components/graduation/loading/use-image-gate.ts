"use client";

import { useEffect, useRef, type RefObject } from "react";
import { waitForImages } from "./wait-for-images";

export const IMAGE_WAIT_MS = 30_000;

/** Calls `onDone` once every image the current layout renders inside `rootRef` has loaded at the size the browser picked. */
export function useImageGate(rootRef: RefObject<HTMLElement | null>, onDone: () => void) {
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      onDoneRef.current();
      return;
    }
    let cancelled = false;
    // Hydration renders the desktop layout first (useCompactLayout's server snapshot); wait two frames
    // so the phone re-render has committed and the images (and their `sizes`) match this screen.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        waitForImages(root.querySelectorAll("img"), IMAGE_WAIT_MS).then(() => {
          if (!cancelled) onDoneRef.current();
        });
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [rootRef]);
}
