"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

export type BeePulseHandle = {
  /** `head`: the bee's head on screen (centre and radius, CSS px). */
  update: (head: { x: number; y: number; r: number }, visible: boolean) => void;
};

/** Share of the head's diameter the halo spans, so it stays inside the head. */
const HALO_SHARE = 0.85;

/** Tap target pinned to the intro bee's head with direct DOM transforms; a soft halo breathes on it. */
export const BeePulse = forwardRef<BeePulseHandle, { label: string; cue: string; onPress: () => void }>(function BeePulse(
  { label, cue, onPress },
  ref,
) {
  const rootRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      update(head, visible) {
        const root = rootRef.current;
        if (!root) return;
        root.style.transform = `translate3d(${Math.round(head.x)}px, ${Math.round(head.y)}px, 0) translate(-50%, -50%)`;
        root.style.setProperty("--head", `${Math.round(head.r * 2)}px`);
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
      className="group hit-area absolute top-0 left-0 z-7 grid size-(--head) cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 outline-none data-[visible=false]:pointer-events-none"
    >
      <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-1000 ease-(--ease) group-data-[visible=true]:opacity-100">
        {/* Clear in the middle so the glow rims the head instead of washing over it. */}
        <span
          aria-hidden
          className="rounded-full transition-[filter] duration-(--dur-lush) group-hover:brightness-110"
          style={{
            width: `calc(var(--head) * ${HALO_SHARE})`,
            height: `calc(var(--head) * ${HALO_SHARE})`,
            background:
              "radial-gradient(closest-side, transparent 48%, color-mix(in oklab, var(--paper) 85%, transparent) 64%, color-mix(in oklab, var(--canary) 35%, transparent) 78%, transparent)",
            animation: "breathe 4s ease-in-out infinite",
          }}
        />
        <span className="absolute top-full left-1/2 mt-3 -translate-x-1/2 rounded-full bg-paper/70 px-3 py-0.5 font-heading text-[14px] tracking-[0.02em] whitespace-nowrap text-ink-2 italic underline-offset-4 backdrop-blur-sm group-focus-visible:underline group-focus-visible:decoration-blue">
          {cue}
        </span>
      </span>
    </button>
  );
});
