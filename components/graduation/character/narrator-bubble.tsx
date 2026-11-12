"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { useCopy } from "../i18n/lang-context";
import type { NarrationKey } from "./types";

export type NarratorBubbleHandle = {
  update: (head: { x: number; y: number }, line: NarrationKey | null) => void;
};

const EDGE_MARGIN = 12;
const TAIL_INSET = 16;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

type Box = { left: number; top: number; right: number; bottom: number };

/** Whether a box overlaps any visible `[data-bubble-avoid]` element, i.e. content the bubble must not cover. */
function coversAvoided(box: Box): boolean {
  return [...document.querySelectorAll("[data-bubble-avoid]")].some((el) => {
    if (el.checkVisibility?.({ visibilityProperty: true }) === false) return false;
    const r = el.getBoundingClientRect();
    return box.left < r.right && box.right > r.left && box.top < r.bottom && box.bottom > r.top;
  });
}

type Props = {
  guestName: string;
};

/**
 * Speech bubble following the 3D character's head on screen.
 * Direct DOM transforms bypass React rendering loops for 60fps tracking.
 * Text typewriter effect triggers only when the narration key changes.
 */
export const NarratorBubble = forwardRef<NarratorBubbleHandle, Props>(function NarratorBubble(
  { guestName },
  ref,
) {
  const { narrator: t } = useCopy();
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeLine, setActiveLine] = useState<NarrationKey | null>(null);
  const [typedText, setTypedText] = useState("");
  const activeLineRef = useRef<NarrationKey | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      update(head, line) {
        const root = rootRef.current;
        if (!root) return;

        if (!line) {
          root.style.opacity = "0";
          root.style.pointerEvents = "none";
          if (activeLineRef.current !== null) {
            activeLineRef.current = null;
            setActiveLine(null);
          }
          return;
        }

        // Keep the bubble on screen; the tail shifts the other way so it still points at the head.
        const half = root.offsetWidth / 2;
        const x = clamp(head.x, half + EDGE_MARGIN, window.innerWidth - half - EDGE_MARGIN);
        const bottom = head.y - 70;
        const tail = clamp(head.x - x, TAIL_INSET - half, half - TAIL_INSET);
        root.style.setProperty("--tail", `${Math.round(tail)}px`);
        root.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(bottom)}px, 0) translate(-50%, -100%)`;
        root.style.opacity = coversAvoided({ left: x - half, right: x + half, top: bottom - root.offsetHeight, bottom }) ? "0" : "1";

        if (activeLineRef.current !== line) {
          activeLineRef.current = line;
          setActiveLine(line);
        }
      },
    }),
    [],
  );

  useEffect(() => {
    if (!activeLine) {
      setTypedText("");
      return;
    }
    const fullText = t[activeLine](guestName);
    let i = 0;
    setTypedText("");
    const interval = window.setInterval(() => {
      i++;
      setTypedText(fullText.slice(0, i));
      if (i >= fullText.length) {
        window.clearInterval(interval);
      }
    }, 24);

    return () => window.clearInterval(interval);
  }, [activeLine, guestName, t]);

  return (
    <div
      ref={rootRef}
      aria-live="polite"
      className="pointer-events-none fixed top-0 left-0 z-30 transition-opacity duration-200"
      style={{ opacity: 0 }}
    >
      <div className="relative max-w-[calc(100vw-24px)] rounded-xl border-[1.5px] border-ink bg-paper px-4 py-2 text-[14px] font-medium text-ink shadow-[2px_2px_0_var(--ink)]">
        <span>{typedText}</span>
        {/* Pointer tail pointing down towards the character's head */}
        <div
          aria-hidden
          className="absolute -bottom-2 left-[calc(50%+var(--tail,0px))] h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[8px] border-x-transparent border-t-ink"
        />
        <div
          aria-hidden
          className="absolute -bottom-[6.5px] left-[calc(50%+var(--tail,0px))] h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[7px] border-x-transparent border-t-paper"
        />
      </div>
    </div>
  );
});
