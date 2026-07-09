"use client";

import { useEffect, useRef, type RefObject } from "react";

export function useScrollReveal<T extends HTMLElement>(
  stagger = false,
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const targets = stagger ? (Array.from(el.children) as HTMLElement[]) : [el];
    if (targets.length === 0) return;

    const y = stagger ? 22 : 26;
    const duration = stagger ? 0.7 : 0.8;

    targets.forEach((target) => {
      target.style.opacity = "0";
      target.style.transform = `translateY(${y}px)`;
      target.style.transition = `opacity ${duration}s ease, transform ${duration}s ease`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          const delay = stagger ? targets.indexOf(target) * 0.08 : 0;
          target.style.transitionDelay = `${delay}s`;
          target.style.opacity = "1";
          target.style.transform = "none";
          observer.unobserve(target);
        });
      },
      { threshold: 0.12 },
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [stagger]);

  return ref;
}
