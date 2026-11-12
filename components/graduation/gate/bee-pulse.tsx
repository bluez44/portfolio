"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

export type BeePulseHandle = {
  update: (pos: { x: number; y: number }, visible: boolean) => void;
};

/** Staggered so a new ripple leaves just as the previous one is halfway out. */
const RIPPLE_DELAYS = ["0s", "1.2s", "2.4s"];

/** Tap target that tracks the intro bee with direct DOM transforms; tapping the bee opens the invitation. */
export const BeePulse = forwardRef<BeePulseHandle, { label: string; cue: string; onPress: () => void }>(function BeePulse(
  { label, cue, onPress },
  ref,
) {
  const rootRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      update(pos, visible) {
        const root = rootRef.current;
        if (!root) return;
        root.style.transform = `translate3d(${Math.round(pos.x)}px, ${Math.round(pos.y)}px, 0) translate(-50%, -50%)`;
        if (root.dataset.visible === String(visible)) return;
        root.dataset.visible = String(visible);
        root.tabIndex = visible ? 0 : -1;
        root.setAttribute("aria-hidden", String(!visible));
      },
    }),
    [],
  );

  return (
    <button
      ref={rootRef}
      type="button"
      data-intro-wake
      data-visible="false"
      aria-label={label}
      aria-hidden
      tabIndex={-1}
      onClick={onPress}
      className="group absolute top-0 left-0 z-7 grid h-28 w-28 outline-none cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 data-[visible=false]:pointer-events-none"
    >
      <span className="absolute inset-0 scale-90 opacity-0 transition-[opacity,scale] duration-(--dur-lush) ease-(--ease) group-data-[visible=true]:scale-100 group-data-[visible=true]:opacity-100">
        <span aria-hidden className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--canary) 30%, transparent), transparent)" }} />
        {RIPPLE_DELAYS.map((delay) => (
          <span
            key={delay}
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-tomato opacity-0"
            style={{ animation: `tap-ripple 3.6s var(--ease) ${delay} infinite` }}
          />
        ))}
        <span aria-hidden className="absolute inset-[14%] rounded-full border-[1.5px] border-ink/25 transition-colors duration-(--dur-base) group-hover:border-tomato/60 group-focus-visible:border-2 group-focus-visible:border-blue" />
        <span className="absolute top-full left-1/2 mt-1 flex -translate-x-1/2 items-center gap-2 rounded-full border-[1.5px] border-ink bg-paper px-3 py-1 font-mono text-[10px] tracking-[0.2em] whitespace-nowrap text-ink uppercase shadow-(--offset-xs)">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-tomato" style={{ animation: "pulse-dot 2.4s ease-in-out infinite" }} />
          {cue}
        </span>
      </span>
    </button>
  );
});
