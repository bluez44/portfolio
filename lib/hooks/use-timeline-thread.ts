"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useTimelineThread(
  containerRef: RefObject<HTMLDivElement | null>,
  entrySelector: string,
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const knotRef = useRef<SVGCircleElement>(null);
  const lengthRef = useRef(0);
  const progressRef = useRef(0);
  const cardPointsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const container = containerRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!container || !svg || !path) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const setProgress = (progress: number) => {
      progressRef.current = progress;
      if (!lengthRef.current) return;
      const knotPoint = path.getPointAtLength(
        lengthRef.current * Math.max(0, Math.min(1, progress)),
      );
      path.style.strokeDashoffset = String(lengthRef.current * (1 - progress));
      const knot = knotRef.current;
      if (!knot) return;
      knot.style.opacity = progress > 0.005 && progress < 0.995 ? "1" : "0";
      knot.setAttribute("cx", knotPoint.x.toFixed(1));
      knot.setAttribute("cy", knotPoint.y.toFixed(1));

      const containerRect = container.getBoundingClientRect();
      const activeRadius = 274;
      const maxScale = 4;
      for (const point of cardPointsRef.current) {
        const pointRect = point.getBoundingClientRect();
        const pointX =
          pointRect.left - containerRect.left + pointRect.width / 2;
        const pointY = pointRect.top - containerRect.top + pointRect.height / 2;
        const distance = Math.hypot(pointX - knotPoint.x, pointY - knotPoint.y);
        const intensity = Math.max(0, 1 - distance / activeRadius);
        gsap.set(point, {
          scale: 1 + intensity * (maxScale - 1),
          transformOrigin: "50% 50%",
        });

        gsap.set(point.parentElement, {
          scale: Math.max(1, 1 + intensity / 10),
        });
      }
    };

    const build = () => {
      const cards = container.querySelectorAll<HTMLElement>(entrySelector);
      const startPoint = document.getElementById("timeline-knot-start");
      const endPoint = document.getElementById("timeline-knot-end");
      const cardPoints = Array.from(cards)
        .map((card) => card.querySelector<HTMLElement>("[data-tl-point]"))
        .filter(Boolean) as HTMLElement[];
      if (cards.length === 0 || cardPoints.length === 0) return;
      cardPointsRef.current = cardPoints;
      const containerRect = container.getBoundingClientRect();
      if (!containerRect.width || !containerRect.height) return;
      svg.setAttribute(
        "viewBox",
        `0 0 ${Math.round(containerRect.width)} ${Math.round(containerRect.height)}`,
      );
      const pointElements = [startPoint, ...cardPoints, endPoint].filter(
        Boolean,
      ) as HTMLElement[];

      const points = pointElements.map((point) => {
        const rect = point.getBoundingClientRect();
        return {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
        };
      });
      let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        d += ` C ${(a.x - dx * 0.3).toFixed(1)} ${(a.y + dy * 0.5).toFixed(1)}, ${(b.x + dx * 0.3).toFixed(1)} ${(b.y - dy * 0.5).toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
      }
      path.setAttribute("d", d);
      lengthRef.current = path.getTotalLength();
      path.style.strokeDasharray = String(lengthRef.current);
      setProgress(progressRef.current);
    };

    build();
    const onResize = () => build();
    window.addEventListener("resize", onResize);

    let scrollTrigger: ScrollTrigger | undefined;
    if (reduceMotion) {
      setProgress(1);
    } else {
      const proxy = { progress: 0 };
      const tween = gsap.to(proxy, {
        progress: 1,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top 68%",
          end: "bottom 60%",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
        onUpdate: () => setProgress(proxy.progress),
      });
      scrollTrigger = tween.scrollTrigger ?? undefined;
      ScrollTrigger.addEventListener("refreshInit", build);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      ScrollTrigger.removeEventListener("refreshInit", build);
      scrollTrigger?.kill();
    };
  }, [containerRef, entrySelector]);

  return { svgRef, pathRef, knotRef };
}
