"use client";

import { useEffect, type RefObject } from "react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { MOBILE_BREAKPOINT } from "./scene/constants";

/** Lower share of the viewport the character occupies on narrow screens. */
const CHARACTER_ZONE = "-55% 0px 0px 0px";

/** On narrow screens, fades the character layer out while any `[data-character-avoid]` element is in its zone. */
export function useCharacterAvoid(layerRef: RefObject<HTMLElement | null>) {
  const narrow = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

  useEffect(() => {
    const layer = layerRef.current;
    if (!narrow || !layer) return;
    const inZone = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inZone.add(entry.target);
          else inZone.delete(entry.target);
        }
        layer.style.opacity = inZone.size ? "0" : "";
      },
      { rootMargin: CHARACTER_ZONE },
    );
    document.querySelectorAll("[data-character-avoid]").forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      layer.style.opacity = "";
    };
  }, [layerRef, narrow]);
}
