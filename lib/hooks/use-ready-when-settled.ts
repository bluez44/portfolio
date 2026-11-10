"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * True once `ref` is within `rootMargin` of the viewport and scrolling has then paused for
 * `settleMs`, so heavy work (e.g. mounting an iframe) never starts mid-scroll. Stays true.
 */
export function useReadyWhenSettled(
  ref: RefObject<Element | null>,
  { rootMargin, settleMs }: { rootMargin: string; settleMs: number },
): boolean {
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && setNear(true), { rootMargin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, near, rootMargin]);

  useEffect(() => {
    if (!near || ready) return;
    let timer = window.setTimeout(() => setReady(true), settleMs);
    const restart = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setReady(true), settleMs);
    };
    window.addEventListener("scroll", restart, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", restart);
    };
  }, [near, ready, settleMs]);

  return ready;
}
