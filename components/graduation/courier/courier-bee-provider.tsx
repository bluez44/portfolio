"use client";

import gsap from "gsap";
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { readRisoPalette } from "../shared/three/palette";
import { usePaletteSync } from "../shared/three/use-palette-sync";
import { createBeeScene, type BeeScene, type BeeState } from "../wishes/bee-scene";
import { cubicBezier, quadraticBezier, type Point } from "./flight-path";

/** When the courier bee lands on an opened wish card; the card waits this long to reveal. */
export const BEE_CARD_REVEAL_DELAY_MS = 1300;

type CourierBeeContextType = {
  /** Whether the 3D bee exists (WebGL available, motion allowed); read it in event handlers. */
  canFly: () => boolean;
  flyOpen: (from: Point, cardId: string) => void;
  flyAway: () => void;
  carryOff: (cardEl: HTMLElement) => Promise<void>;
};

const CourierBeeContext = createContext<CourierBeeContextType | null>(null);

export function useCourierBee(): CourierBeeContextType {
  const ctx = useContext(CourierBeeContext);
  if (!ctx) {
    return {
      canFly: () => false,
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

  useEffect(() => {
    const host = hostRef.current;
    if (reduced || !host) return;
    let scene: BeeScene;
    try {
      scene = createBeeScene(host, readRisoPalette());
    } catch {
      return;
    }
    sceneRef.current = scene;
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
    };
  }, [reduced]);
  usePaletteSync(sceneRef);

  const canFly = useCallback(() => sceneRef.current !== null, []);

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
      const perch: Point = { x: cr.left + cr.width / 2, y: cr.top + 20 };
      // Flies in from off-screen top-right and lands on the letter before picking it up.
      const from: Point = { x: window.innerWidth + 80, y: Math.max(-80, perch.y - 220) };
      const inC1: Point = { x: from.x - 200, y: from.y - 120 };
      const inC2: Point = { x: perch.x + 160, y: perch.y - 180 };
      const endPoint: Point = { x: window.innerWidth * 0.75, y: window.innerHeight + 160 };
      const ctrlPoint: Point = { x: perch.x + 80, y: perch.y - 120 };
      // The card keeps the fold it already has (rotateX, scale) and only gains the carry offset on top.
      const foldScale = Number(gsap.getProperty(cardEl, "scale")) || 1;

      const bee: BeeState = (beeRef.current = { x: from.x, y: from.y, s: 1, on: true, perched: false });

      const pts: string[] = [];
      const track = () => {
        pts.push(`${Math.round(bee.x)},${Math.round(bee.y)}`);
        trail?.setAttribute("points", pts.join(" "));
      };
      const arrive = { t: 0 };
      const carry = { t: 0 };

      return new Promise<void>((resolve) => {
        const tl = gsap
          .timeline({
            onComplete: () => {
              bee.on = false;
              resolve();
            },
          })
          .to(arrive, {
            t: 1,
            duration: 0.85,
            ease: "power2.out",
            onUpdate: () => {
              const p = cubicBezier(arrive.t, from, inC1, inC2, perch);
              bee.x = p.x;
              bee.y = p.y;
              track();
            },
            onComplete: () => {
              bee.perched = true;
            },
          })
          .add(() => {
            bee.perched = false;
          }, "+=0.25")
          .to(carry, {
            t: 1,
            duration: 1.2,
            ease: "power2.in",
            onUpdate: () => {
              const p = quadraticBezier(carry.t, perch, ctrlPoint, endPoint);
              bee.x = p.x;
              bee.y = p.y;
              track();
              gsap.set(cardEl, {
                x: p.x - perch.x,
                y: p.y - perch.y,
                scale: foldScale * Math.max(0.2, 1 - carry.t * 0.75),
                rotation: carry.t * 12,
                opacity: Math.max(0, 1 - carry.t * 1.2),
              });
            },
          });
        if (trail) tl.to(trail, { opacity: 0, duration: 0.4 }, "-=0.35");
        tlRef.current = tl;
      });
    },
    [reduced],
  );

  return (
    <CourierBeeContext.Provider value={{ canFly, flyOpen, flyAway, carryOff }}>
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
