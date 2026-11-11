"use client";

import Image from "next/image";
import LoadingCat from "@/public/lottie/Bad Cat.svg";

/** Full-screen riso loading screen; fades out (and stops catching events) once `ready`. */
export function LoadingOverlay({ ready }: { ready: boolean }) {
  return (
    <div
      id="scene-loading-overlay"
      aria-hidden={ready}
      role="status"
      className={`fixed inset-0 z-100 flex flex-col items-center justify-center gap-5 bg-paper transition-opacity duration-500 ${
        ready ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* halftone backdrop */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply"
        style={{
          background:
            "radial-gradient(color-mix(in oklab, var(--ink) 8%, transparent) 1px, transparent 1.5px)",
          backgroundSize: "22px 22px",
        }}
      />

      <Image
        src={LoadingCat}
        alt="Loading cat"
        width={200}
        height={200}
        className="relative animate-spin-slow"
      />

      <div className="relative flex items-center gap-2">
        <span
          aria-hidden
          className="h-2 w-2 rounded-full border-[1.5px] border-ink bg-tomato"
          style={{
            boxShadow: "1.5px 1.5px 0 var(--ink)",
            animation: "pulse-dot 1.4s ease-in-out infinite",
          }}
        />
        <p className="font-mono text-[12px] tracking-[0.22em] text-ink-2 uppercase">
          Loading experience
        </p>
      </div>
    </div>
  );
}
