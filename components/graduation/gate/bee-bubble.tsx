"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useCopy } from "../i18n/lang-context";

/** Matches the intro's phone layout (`max-[759px]` in bee-intro). */
const PHONE_QUERY = "(max-width: 759px)";
const TYPE_MS = 24;
const NOTICE_HOLD_MS = 2600;
const TIP_HOLD_MS = 4200;

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
  const phone = useMediaQuery(PHONE_QUERY);
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
    const notice = t.beeNotice(guestName);
    // On phones the bee slips in one nudge towards a bigger screen, then settles back on the notice.
    // It plays once so the live region is not re-announced in a loop.
    const lines = loading ? [t.beePreparing] : phone ? [notice, t.beeMobileTip, notice] : [notice];
    let line = 0;
    let timer = 0;

    const next = () => {
      if (line >= lines.length - 1) return;
      timer = window.setTimeout(() => {
        line++;
        type();
      }, lines[line] === notice ? NOTICE_HOLD_MS : TIP_HOLD_MS);
    };
    const type = () => {
      const text = lines[line];
      if (reduced) {
        setTypedText(text);
        next();
        return;
      }
      let i = 0;
      setTypedText("");
      const tick = () => {
        i++;
        setTypedText(text.slice(0, i));
        if (i < text.length) timer = window.setTimeout(tick, TYPE_MS);
        else next();
      };
      timer = window.setTimeout(tick, TYPE_MS);
    };

    type();
    return () => window.clearTimeout(timer);
  }, [started, loading, phone, guestName, t, reduced]);

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
