"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { useCopy } from "../i18n/lang-context";
import { useCompactLayout } from "../shared/use-compact-layout";
import { placeBubble } from "./bubble-placement";
import { characterProfile } from "./choreography/profile";
import type { NarrationKey } from "./types";

export type NarratorBubbleHandle = {
  update: (head: { x: number; y: number }, line: NarrationKey | null) => void;
};

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
  const { bubble } = characterProfile(useCompactLayout());
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

        // Off stage (phones walk it out during the note finale): nothing to point at.
        if (!line || head.x < 0 || head.x > window.innerWidth) {
          root.style.opacity = "0";
          root.style.pointerEvents = "none";
          if (activeLineRef.current !== null) {
            activeLineRef.current = null;
            setActiveLine(null);
          }
          return;
        }

        const w = root.offsetWidth;
        const h = root.offsetHeight;
        const { left, top, tail, tailOffset } = placeBubble(head, { w, h }, window.innerWidth, bubble);
        root.dataset.tail = tail;
        root.style.setProperty("--tail", `${Math.round(tailOffset)}px`);
        root.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
        root.style.opacity = coversAvoided({ left, right: left + w, top, bottom: top + h }) ? "0" : "1";

        if (activeLineRef.current !== line) {
          activeLineRef.current = line;
          setActiveLine(line);
        }
      },
    }),
    [bubble],
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
      data-tail="bottom"
      className="group pointer-events-none fixed top-0 left-0 z-30 transition-opacity duration-200"
      style={{ opacity: 0 }}
    >
      <div className="relative w-max max-w-[calc(100vw-24px)] rounded-xl border-[1.5px] border-ink bg-paper px-4 py-2 text-[14px] font-medium text-ink shadow-[2px_2px_0_var(--ink)] max-[759px]:max-w-[60vw] max-[759px]:rounded-lg max-[759px]:px-2.5 max-[759px]:py-1.5 max-[759px]:text-[12px] max-[759px]:leading-snug">
        <span>{typedText}</span>
        {/* Pointer tail towards the character's head: down from below the bubble, or sideways beside it */}
        <div aria-hidden className="hidden group-data-[tail=bottom]:block">
          <div className="absolute -bottom-2 left-[calc(50%+var(--tail,0px))] h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[8px] border-x-transparent border-t-ink" />
          <div className="absolute -bottom-[6.5px] left-[calc(50%+var(--tail,0px))] h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[7px] border-x-transparent border-t-paper" />
        </div>
        <div aria-hidden className="hidden group-data-[tail=right]:block">
          <div className="absolute top-1/2 -right-2 h-0 w-0 -translate-y-1/2 border-y-[6px] border-l-[8px] border-y-transparent border-l-ink" />
          <div className="absolute top-1/2 -right-[6.5px] h-0 w-0 -translate-y-1/2 border-y-[5px] border-l-[7px] border-y-transparent border-l-paper" />
        </div>
        <div aria-hidden className="hidden group-data-[tail=left]:block">
          <div className="absolute top-1/2 -left-2 h-0 w-0 -translate-y-1/2 border-y-[6px] border-r-[8px] border-y-transparent border-r-ink" />
          <div className="absolute top-1/2 -left-[6.5px] h-0 w-0 -translate-y-1/2 border-y-[5px] border-r-[7px] border-y-transparent border-r-paper" />
        </div>
      </div>
    </div>
  );
});
