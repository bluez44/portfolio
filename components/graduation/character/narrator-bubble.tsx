"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCopy } from "../i18n/lang-context";
import { useCompactLayout } from "../shared/use-compact-layout";
import { placeBubble } from "./bubble-placement";
import { BubbleTails } from "./bubble-tails";
import { characterProfile } from "./choreography/profile";
import type { NarrationKey } from "./types";

export type NarratorBubbleHandle = {
  update: (head: { x: number; y: number }, line: NarrationKey | null) => void;
};

type Box = { left: number; top: number; right: number; bottom: number };

/** Whether a box overlaps any measured `[data-bubble-avoid]` rect, i.e. content the bubble must not cover. */
function coversAny(box: Box, rects: DOMRect[]): boolean {
  return rects.some((r) => box.left < r.right && box.right > r.left && box.top < r.bottom && box.bottom > r.top);
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
  const sizeRef = useRef({ w: 0, h: 0 });
  const avoidRef = useRef<Element[]>([]);
  const hiddenRef = useRef(true);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    sizeRef.current = { w: rect.width, h: rect.height };
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const box = entry.borderBoxSize?.[0];
      sizeRef.current = box
        ? { w: box.inlineSize, h: box.blockSize }
        : { w: entry.contentRect.width, h: entry.contentRect.height };
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const refreshAvoid = () => {
      avoidRef.current = [...document.querySelectorAll("[data-bubble-avoid]")];
    };
    ScrollTrigger.addEventListener("refresh", refreshAvoid);
    return () => ScrollTrigger.removeEventListener("refresh", refreshAvoid);
  }, []);

  useEffect(() => {
    avoidRef.current = [...document.querySelectorAll("[data-bubble-avoid]")];
  }, [activeLine]);

  useImperativeHandle(
    ref,
    () => ({
      update(head, line) {
        const root = rootRef.current;
        if (!root) return;

        const viewportW = window.innerWidth;

        // Off stage (phones walk it out during the note finale): nothing to point at.
        if (!line || head.x < 0 || head.x > viewportW) {
          if (activeLineRef.current !== null) {
            activeLineRef.current = null;
            setActiveLine(null);
          }
          if (hiddenRef.current) return;
          hiddenRef.current = true;
          root.style.opacity = "0";
          root.style.pointerEvents = "none";
          return;
        }

        // Read all avoided rects before writing styles so the frame stays read-then-write.
        const avoidRects: DOMRect[] = [];
        for (const el of avoidRef.current) {
          if (el.checkVisibility?.({ visibilityProperty: true }) === false) continue;
          avoidRects.push(el.getBoundingClientRect());
        }

        const { w, h } = sizeRef.current;
        const { left, top, tail, tailOffset } = placeBubble(head, { w, h }, viewportW, bubble);
        const covered = coversAny({ left, right: left + w, top, bottom: top + h }, avoidRects);

        hiddenRef.current = covered;
        root.dataset.tail = tail;
        root.style.setProperty("--tail", `${Math.round(tailOffset)}px`);
        root.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
        root.style.opacity = covered ? "0" : "1";

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
        <BubbleTails />
      </div>
    </div>
  );
});
