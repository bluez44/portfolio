"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.8;
const DRAG_THRESHOLD = 5;

/**
 * Drag-to-pan + zoom for an element centered inside a clipping viewport,
 * ported from the design comp's comb interactions.
 */
export function usePanZoom(extent: [number, number]) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const pan = useRef({ x: 0, y: 0, z: 0.7 });
  const drag = useRef<{ x: number; y: number; px: number; py: number; id: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [zoomPct, setZoomPct] = useState(70);

  const apply = useCallback((anim: boolean) => {
    const el = targetRef.current;
    if (!el) return;
    const p = pan.current;
    el.style.transition = anim ? "transform 320ms cubic-bezier(0.22,1,0.36,1)" : "none";
    el.style.transform = `translate(${p.x}px,${p.y}px) scale(${p.z})`;
  }, []);

  const clamp = useCallback(() => {
    const p = pan.current;
    const lx = extent[0] * 0.55 * p.z;
    const ly = extent[1] * 0.55 * p.z;
    p.x = Math.max(-lx, Math.min(lx, p.x));
    p.y = Math.max(-ly, Math.min(ly, p.y));
  }, [extent]);

  const fit = useCallback(
    (anim: boolean) => {
      const vp = viewportRef.current;
      if (!vp) return;
      const z = Math.max(MIN_ZOOM, Math.min(1, vp.clientWidth / extent[0], vp.clientHeight / extent[1]));
      pan.current = { x: 0, y: 0, z };
      apply(anim);
      setZoomPct(Math.round(z * 100));
    },
    [extent, apply],
  );

  const zoomBy = useCallback(
    (f: number) => {
      const p = pan.current;
      const z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, p.z * f));
      p.x *= z / p.z;
      p.y *= z / p.z;
      p.z = z;
      clamp();
      apply(true);
      setZoomPct(Math.round(z * 100));
    },
    [clamp, apply],
  );

  const setTarget = useCallback(
    (el: HTMLDivElement | null) => {
      targetRef.current = el;
      if (el) apply(false);
    },
    [apply],
  );

  useEffect(() => {
    fit(false);
    const onResize = () => fit(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [fit]);

  const onPointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (e.button) return;
    const p = pan.current;
    drag.current = { x: e.clientX, y: e.clientY, px: p.x, py: p.y, id: e.pointerId, moved: false };
  }, []);

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (!d.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        d.moved = true;
        try {
          e.currentTarget.setPointerCapture(d.id);
        } catch {}
        e.currentTarget.style.cursor = "grabbing";
      }
      if (d.moved) {
        pan.current.x = d.px + dx;
        pan.current.y = d.py + dy;
        clamp();
        apply(false);
      }
    },
    [clamp, apply],
  );

  const onPointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    e.currentTarget.style.cursor = "grab";
    if (d?.moved) {
      // Swallow the click that ends a drag so it doesn't open a wish.
      suppressClick.current = true;
      setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    }
  }, []);

  return {
    viewportRef,
    setTarget,
    zoomPct,
    zoomIn: () => zoomBy(1.2),
    zoomOut: () => zoomBy(1 / 1.2),
    reset: () => fit(true),
    refit: fit,
    suppressClick,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  };
}
