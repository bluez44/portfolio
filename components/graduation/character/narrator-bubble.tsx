"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { useCopy } from "../i18n/lang-context";
import type { NarrationKey } from "./types";

export type NarratorBubbleHandle = {
  update: (head: { x: number; y: number }, line: NarrationKey | null) => void;
};

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

        root.style.opacity = "1";
        // Position bubble above the character's head, horizontally centered
        root.style.transform = `translate3d(${Math.round(head.x)}px, ${Math.round(head.y - 70)}px, 0) translate(-50%, -100%)`;

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
      <div className="relative rounded-xl border-[1.5px] border-ink bg-paper px-4 py-2 text-[14px] font-medium text-ink shadow-[2px_2px_0_var(--ink)]">
        <span>{typedText}</span>
        {/* Pointer tail pointing down towards the character's head */}
        <div
          aria-hidden
          className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[8px] border-x-transparent border-t-ink"
        />
        <div
          aria-hidden
          className="absolute -bottom-[6.5px] left-1/2 h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[7px] border-x-transparent border-t-paper"
        />
      </div>
    </div>
  );
});
