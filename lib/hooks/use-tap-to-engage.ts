"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

/** Opt-in interaction for embeds that swallow gestures; touch has no "mouse leave", so leaving the viewport releases it. */
export function useTapToEngage(ref: RefObject<HTMLElement | null>) {
  const [engaged, setEngaged] = useState(false);
  const engage = useCallback(() => setEngaged(true), []);
  const release = useCallback(() => setEngaged(false), []);

  useEffect(() => {
    const el = ref.current;
    if (!engaged || !el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setEngaged(false);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, engaged]);

  return { engaged, engage, release };
}
