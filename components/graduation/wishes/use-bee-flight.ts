"use client";

import gsap from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { createBeeScene, type BeeScene, type BeeState } from "./bee-scene";

export const BEE_CARD_REVEAL_DELAY_MS = 1300;

type Point = { x: number; y: number };

const cubic = (t: number, a: number, b: number, c: number, d: number) => {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};

/**
 * The design's courier-bee choreography: a 3D bee pops out of the clicked
 * hex, flies a bezier arc leaving a dotted trail, perches on the opened
 * postcard, and buzzes away on close.
 */
export function useBeeFlight() {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reflects the effect-created WebGL scene
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

  /** Fly from the clicked cell to the card already mounted under `cardId`. */
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
            const t = prog.t;
            bee.x = cubic(t, from.x, c1.x, c2.x, to.x);
            bee.y = cubic(t, from.y, c1.y, c2.y, to.y);
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
    const e = { x: innerWidth + 90, y: -90 };
    const c = { x: f.x - 140, y: f.y - 160 };
    const p = { t: 0 };
    tlRef.current = gsap.timeline().to(p, {
      t: 1,
      duration: 0.95,
      ease: "power2.in",
      onUpdate: () => {
        const t = p.t;
        const u = 1 - t;
        bee.x = u * u * f.x + 2 * u * t * c.x + t * t * e.x;
        bee.y = u * u * f.y + 2 * u * t * c.y + t * t * e.y;
      },
      onComplete: () => {
        bee.on = false;
      },
    });
  }, []);

  return { hostRef, trailRef, active, flyOpen, flyAway };
}
