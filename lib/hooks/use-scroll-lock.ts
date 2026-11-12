"use client";

import { useEffect } from "react";
import { useLenis } from "@/components/providers/lenis-context";

/** Freezes page scroll, native and Lenis, while `locked`. */
export function useScrollLock(locked: boolean) {
  const lenis = useLenis();
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      document.body.style.overflow = previous;
      lenis?.start();
    };
  }, [locked, lenis]);
}
