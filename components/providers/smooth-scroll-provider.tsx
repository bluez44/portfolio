"use client";

import { useEffect, useState, type ReactNode } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { LenisContext } from "./lenis-context";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const disabled = usePathname()?.startsWith("/admin") ?? false;

  useEffect(() => {
    if (disabled) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const instance = new Lenis({
      // <html> is h-full, so its box never resizes; observe <body> so the scroll limit follows content height.
      content: document.body,
      duration: 1.05,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    const onTick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    gsap.registerPlugin(ScrollTrigger);
    instance.on("scroll", ScrollTrigger.update);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance);

    const onAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.length < 2) return;
      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;
      event.preventDefault();
      instance.scrollTo(target, { offset: -64, duration: 1.15 });
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(onTick);
      setLenis(null);
      instance.destroy();
    };
  }, [disabled]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
