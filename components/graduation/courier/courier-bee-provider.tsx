"use client";

import gsap from "gsap";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { createBeeScene, type BeeScene, type BeeState } from "../wishes/bee-scene";
import { cubicBezier, quadraticBezier, type Point } from "./flight-path";

type CourierBeeContextType = {
  active: boolean;
  flyOpen: (from: Point, cardId: string) => void;
  flyAway: () => void;
  carryOff: (cardEl: HTMLElement) => Promise<void>;
};

const CourierBeeContext = createContext<CourierBeeContextType | null>(null);

export function useCourierBee(): CourierBeeContextType {
  const ctx = useContext(CourierBeeContext);
  if (!ctx) {
    return {
      active: false,
      flyOpen: () => {},
      flyAway: () => {},
      carryOff: async () => {},
    };
  }
  return ctx;
}

export function CourierBeeProvider({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<SVGPolylineElement>(null);
  const sceneRef = useRef<BeeScene | null>(null);
  const beeRef = useRef<BeeState | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (reduced || !host) return;
    let scene: BeeScene;
    try {
      scene = createBeeScene(host);
    } catch {
      return;
    }
    sceneRef.current = scene;
    setActive(true);
    const tick = (time: number) => scene.frame(time, beeRef.current);
    gsap.ticker.add(tick);
    const onResize = () => scene.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(tick);
      tlRef.current?.kill();
      tlRef.current = null;
      scene.dispose();
      sceneRef.current = null;
      setActive(false);
    };
  }, [reduced]);

  const flyOpen = useCallback((from: Point, cardId: string) => {
    const trail = trailRef.current;
    const card = document.getElementById(cardId);
    if (!sceneRef.current || !trail || !card) return;
    tlRef.current?.kill();
    const cr = card.getBoundingClientRect();
    const to = { x: cr.left + cr.width / 2, y: cr.top + cr.height / 2 };
    const perch = { x: cr.left + 34, y: cr.top - 4 };
    const sg = to.x >= from.x ? 1 : -1;
    const c1 = { x: from.x - sg * 120, y: from.y - 260 };
    const c2 = { x: to.x + sg * 260, y: to.y - 220 };
    const bee: BeeState = (beeRef.current = { x: from.x, y: from.y, s: 0, on: true, perched: false });
    const pts: string[] = [];
    const prog = { t: 0 };
    trail.setAttribute("points", "");
    gsap.set(trail, { opacity: 1 });
    tlRef.current = gsap
      .timeline()
      .to(bee, { s: 1, duration: 0.35, ease: "back.out(2.2)" }, 0)
      .to(
        prog,
        {
          t: 1,
          duration: 1.15,
          ease: "power1.inOut",
          onUpdate: () => {
            const p = cubicBezier(prog.t, from, c1, c2, to);
            bee.x = p.x;
            bee.y = p.y;
            pts.push(`${Math.round(bee.x)},${Math.round(bee.y)}`);
            trail.setAttribute("points", pts.join(" "));
          },
        },
        0.2,
      )
      .to(
        bee,
        {
          x: perch.x,
          y: perch.y,
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => {
            bee.perched = true;
          },
        },
        1.45,
      )
      .to(trail, { opacity: 0, duration: 0.7 }, 1.8);
  }, []);

  const flyAway = useCallback(() => {
    const bee = beeRef.current;
    tlRef.current?.kill();
    if (trailRef.current) gsap.set(trailRef.current, { opacity: 0 });
    if (!bee || !bee.on) return;
    bee.perched = false;
    const f = { x: bee.x, y: bee.y };
    const e = { x: window.innerWidth + 90, y: -90 };
    const c = { x: f.x - 140, y: f.y - 160 };
    const p = { t: 0 };
    tlRef.current = gsap.timeline().to(p, {
      t: 1,
      duration: 0.95,
      ease: "power2.in",
      onUpdate: () => {
        const pt = quadraticBezier(p.t, f, c, e);
        bee.x = pt.x;
        bee.y = pt.y;
      },
      onComplete: () => {
        bee.on = false;
      },
    });
  }, []);

  const carryOff = useCallback(
    async (cardEl: HTMLElement) => {
      if (reduced || !sceneRef.current) return;
      tlRef.current?.kill();
      const trail = trailRef.current;
      if (trail) {
        trail.setAttribute("points", "");
        gsap.set(trail, { opacity: 1 });
      }

      const cr = cardEl.getBoundingClientRect();
      const startPoint: Point = { x: cr.left + cr.width / 2, y: cr.top + 20 };
      const endPoint: Point = { x: window.innerWidth * 0.75, y: window.innerHeight + 160 };
      const ctrlPoint: Point = { x: startPoint.x + 80, y: startPoint.y - 120 };

      const bee: BeeState = (beeRef.current = {
        x: startPoint.x,
        y: startPoint.y,
        s: 0,
        on: true,
        perched: true,
      });

      const pts: string[] = [];
      const prog = { t: 0 };

      return new Promise<void>((resolve) => {
        tlRef.current = gsap
          .timeline({
            onComplete: () => {
              bee.on = false;
              resolve();
            },
          })
          .to(bee, { s: 1, duration: 0.3, ease: "power2.out" }, 0)
          .to(
            prog,
            {
              t: 1,
              duration: 1.25,
              ease: "power2.in",
              onUpdate: () => {
                const p = quadraticBezier(prog.t, startPoint, ctrlPoint, endPoint);
                bee.x = p.x;
                bee.y = p.y;
                pts.push(`${Math.round(bee.x)},${Math.round(bee.y)}`);
                if (trail) trail.setAttribute("points", pts.join(" "));

                const dx = p.x - startPoint.x;
                const dy = p.y - startPoint.y;
                const scale = Math.max(0.2, 1 - prog.t * 0.75);
                cardEl.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${scale}) rotate(${prog.t * 12}deg)`;
                cardEl.style.opacity = String(Math.max(0, 1 - prog.t * 1.2));
              },
            },
            0.2,
          )
          .to(trail, { opacity: 0, duration: 0.4 }, 1.1);
      });
    },
    [reduced],
  );

  return (
    <CourierBeeContext.Provider value={{ active, flyOpen, flyAway, carryOff }}>
      {children}
      {/* Shared fullscreen courier bee overlay */}
      <div ref={hostRef} aria-hidden className="pointer-events-none fixed inset-0 z-65" />
      <svg
        aria-hidden
        className="pointer-events-none fixed inset-0 z-64 h-full w-full overflow-visible"
        style={{ opacity: 0 }}
      >
        <polyline
          ref={trailRef}
          fill="none"
          stroke="var(--canary)"
          strokeWidth={3}
          strokeDasharray="0.1 9"
          strokeLinecap="round"
        />
      </svg>
    </CourierBeeContext.Provider>
  );
}
