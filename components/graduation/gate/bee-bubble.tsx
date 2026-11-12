"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useCopy } from "../i18n/lang-context";

export type BeeBubbleHandle = {
  update: (pos: { x: number; y: number }, visible: boolean) => void;
};

type Props = {
  guestName: string;
  /** While the invitation loads the bee says so; once ready it announces the letter. */
  loading: boolean;
};

/** Speech bubble tracking the intro bee with direct DOM transforms at 60fps. */
export const BeeBubble = forwardRef<BeeBubbleHandle, Props>(function BeeBubble({ guestName, loading }, ref) {
  const { gate: t } = useCopy();
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [typedText, setTypedText] = useState("");
  const [started, setStarted] = useState(false);
  const hasStartedRef = useRef(false);

  useImperativeHandle(
    ref,
    () => ({
      update(pos, visible) {
        const root = rootRef.current;
        if (!root) return;

        if (!visible || !hasStartedRef.current) {
          if (root.style.opacity !== "0") {
            root.style.opacity = "0";
            root.style.pointerEvents = "none";
          }
          return;
        }

        // Position bubble above the bee, horizontally centered.
        root.style.transform = `translate3d(${Math.round(pos.x)}px, ${Math.round(pos.y - 44)}px, 0) translate(-50%, -100%)`;
        if (root.style.opacity !== "1") {
          root.style.opacity = "1";
        }
      },
    }),
    [],
  );

  // Delay typewriter slightly to sync with the gate entrance.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      hasStartedRef.current = true;
      setStarted(true);
    }, reduced ? 0 : 500);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  useEffect(() => {
    if (!started) {
      setTypedText("");
      return;
    }
    const fullText = loading ? t.beePreparing : t.beeNotice(guestName);
    if (reduced) {
      setTypedText(fullText);
      return;
    }
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
  }, [started, loading, guestName, t, reduced]);

  return (
    <div
      ref={rootRef}
      aria-live="polite"
      className="pointer-events-none absolute top-0 left-0 z-7 transition-opacity duration-200"
      style={{ opacity: 0 }}
    >
      <div className="relative rounded-xl border-[1.5px] border-ink bg-paper px-3.5 py-2 text-[13px] sm:text-[14px] font-medium leading-snug text-ink shadow-[2px_2px_0_var(--ink)] max-w-[min(280px,calc(100vw-32px))] text-center select-none">
        <span>{typedText}</span>
        {/* Pointer tail pointing down towards the bee */}
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
