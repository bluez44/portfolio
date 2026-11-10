"use client";

import { useEffect, useState, type PointerEvent, type ReactNode } from "react";

/**
 * Wheel events over a cross-origin iframe never reach the page, so Lenis stalls there. This
 * transparent layer catches them so the page keeps smooth-scrolling, and gets out of the way:
 * - while Ctrl/⌘ is held, so Ctrl + scroll still zooms the map;
 * - after a click/tap, until the mouse leaves, so the map can be dragged and its buttons used.
 */
export function ScrollShield({ hint, children }: { hint: string; children: ReactNode }) {
  const [hovering, setHovering] = useState(false);
  const [modifier, setModifier] = useState(false);
  const [engaged, setEngaged] = useState(false);

  useEffect(() => {
    if (!hovering) return;
    const sync = (event: KeyboardEvent) => setModifier(event.ctrlKey || event.metaKey);
    const release = () => setModifier(false);
    window.addEventListener("keydown", sync);
    window.addEventListener("keyup", sync);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("keydown", sync);
      window.removeEventListener("keyup", sync);
      window.removeEventListener("blur", release);
    };
  }, [hovering]);

  // Touch "leaves" on every lift, so only a real mouse leaving disengages.
  const onPointerLeave = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    setHovering(false);
    setModifier(false);
    setEngaged(false);
  };

  const passThrough = engaged || modifier;

  return (
    <div className="group absolute inset-0" onPointerEnter={() => setHovering(true)} onPointerLeave={onPointerLeave}>
      {children}
      <div
        aria-hidden
        onClick={() => setEngaged(true)}
        className={`absolute inset-0 flex items-end justify-center p-3 ${passThrough ? "pointer-events-none" : ""}`}
      >
        <span
          className={`rounded-full border-[1.5px] border-ink bg-paper px-3 py-1 font-mono text-[10px] tracking-[0.14em] text-ink-2 uppercase opacity-0 transition-opacity duration-(--dur-fast) ${
            passThrough ? "" : "group-hover:opacity-100"
          }`}
        >
          {hint}
        </span>
      </div>
    </div>
  );
}
