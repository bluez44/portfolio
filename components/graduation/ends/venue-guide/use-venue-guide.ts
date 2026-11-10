"use client";

import { useRef, useState } from "react";
import { useLenis } from "@/components/providers/lenis-context";
import { SCROLL_OFFSET } from "./constants";
import type { GuideTabId } from "./guide-tabs";

/** Venue-guide tab state, plus `showMap`: switch to the map tab and scroll the guide into view. */
export function useVenueGuide() {
  const ref = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<GuideTabId>("map");
  const lenis = useLenis();

  const showMap = () => {
    setTab("map");
    const el = ref.current;
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el, { offset: -SCROLL_OFFSET });
    } else {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET, behavior: "smooth" });
    }
  };

  return { ref, tab, setTab, showMap };
}
