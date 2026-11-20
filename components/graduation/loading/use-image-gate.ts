"use client";

import { useEffect, useRef, type RefObject } from "react";
import { waitForImages } from "./wait-for-images";

export const IMAGE_WAIT_MS = 30_000;

/** Calls `onDone` once every image rendered inside `rootRef` has loaded at the size the browser picked. */
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
    waitForImages(root.querySelectorAll("img"), IMAGE_WAIT_MS).then(() => {
      if (!cancelled) onDoneRef.current();
    });
    return () => {
      cancelled = true;
    };
  }, [rootRef]);
}
