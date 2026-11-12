"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { useCoarsePointer } from "@/lib/hooks/use-media-query";
import { useTapToEngage } from "@/lib/hooks/use-tap-to-engage";

/**
 * Wheel events over a cross-origin iframe never reach the page, so Lenis stalls there. This
 * transparent layer catches them so the page keeps smooth-scrolling, and gets out of the way:
 * - while Ctrl/⌘ is held, so Ctrl + scroll still zooms the map;
 * - after a click/tap, until the mouse leaves or the map scrolls out of view, so it can be dragged and its buttons used.
 */
export function ScrollShield({ hint, touchHint, children }: { hint: string; touchHint: string; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [modifier, setModifier] = useState(false);
  const { engaged, engage, release } = useTapToEngage(rootRef);
  const coarse = useCoarsePointer();

  useEffect(() => {
    if (!hovering) return;
    const sync = (event: KeyboardEvent) => setModifier(event.ctrlKey || event.metaKey);
    const clearModifier = () => setModifier(false);
    window.addEventListener("keydown", sync);
    window.addEventListener("keyup", sync);
    window.addEventListener("blur", clearModifier);
    return () => {
      window.removeEventListener("keydown", sync);
      window.removeEventListener("keyup", sync);
      window.removeEventListener("blur", clearModifier);
    };
  }, [hovering]);

  // Touch "leaves" on every lift, so only a real mouse leaving disengages.
  const onPointerLeave = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    setHovering(false);
    setModifier(false);
    release();
  };

  const passThrough = engaged || modifier;

  return (
    <div ref={rootRef} className="group absolute inset-0" onPointerEnter={() => setHovering(true)} onPointerLeave={onPointerLeave}>
      {children}
      <div
        aria-hidden
        onClick={engage}
        className={`absolute inset-0 flex items-end justify-center p-3 ${passThrough ? "pointer-events-none" : ""}`}
      >
        <span
          className={`rounded-full border-[1.5px] border-ink bg-paper px-3 py-1 font-mono text-[10px] tracking-[0.14em] text-ink-2 uppercase opacity-0 transition-opacity duration-(--dur-fast) ${
            passThrough ? "" : coarse ? "opacity-100" : "group-hover:opacity-100"
          }`}
        >
          {coarse ? touchHint : hint}
        </span>
      </div>
    </div>
  );
}
