"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

export type BeePulseHandle = {
  update: (pos: { x: number; y: number }, visible: boolean) => void;
};

/** Pulsing tap target that tracks the intro bee with direct DOM transforms; tapping the bee opens the invitation. */
export const BeePulse = forwardRef<BeePulseHandle, { label: string; onPress: () => void }>(function BeePulse({ label, onPress }, ref) {
  const rootRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      update(pos, visible) {
        const root = rootRef.current;
        if (!root) return;
        root.style.transform = `translate3d(${Math.round(pos.x)}px, ${Math.round(pos.y)}px, 0) translate(-50%, -50%)`;
        if (root.style.opacity === (visible ? "1" : "0")) return;
        root.style.opacity = visible ? "1" : "0";
        root.style.pointerEvents = visible ? "auto" : "none";
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
      aria-label={label}
      aria-hidden
      tabIndex={-1}
      onClick={onPress}
      className="riso-focus absolute top-0 left-0 z-7 grid h-24 w-24 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 transition-opacity duration-300"
      style={{ opacity: 0, pointerEvents: "none" }}
    >
      <span aria-hidden className="absolute inset-0 rounded-full border-2 border-tomato motion-safe:animate-ping" />
      <span aria-hidden className="absolute inset-3 rounded-full border-2 border-tomato/70" />
    </button>
  );
});
