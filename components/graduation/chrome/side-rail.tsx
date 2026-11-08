"use client";

import { useRef } from "react";
import { useScrollProgress } from "./use-scroll-progress";

const mono = "font-mono text-[clamp(8px,1.25vh,10px)] uppercase";

function ProgressBar() {
  const ref = useRef<HTMLSpanElement>(null);
  useScrollProgress(ref);
  return <span ref={ref} className="absolute inset-0 origin-bottom bg-tomato" style={{ transform: "scaleY(0)" }} />;
}

export function SideRail({
  side,
  label,
  value,
  sub,
  progress = false,
}: {
  side: "left" | "right";
  label: string;
  value: string;
  sub: string;
  progress?: boolean;
}) {
  return (
    <aside className={`pointer-events-none fixed top-16 bottom-0 z-20 hidden w-[clamp(56px,6vw,88px)] items-center justify-center min-[760px]:flex ${side === "left" ? "left-0" : "right-0"}`}>
      <div className={`flex items-center gap-[clamp(8px,1.8vh,18px)] whitespace-nowrap [writing-mode:vertical-rl] ${side === "left" ? "rotate-180" : ""}`}>
        <span className={`${mono} tracking-[0.24em] text-ink-3`}>{label}</span>
        <span className="relative h-[clamp(20px,5vh,56px)] w-[1.5px] overflow-hidden bg-ink/20">{progress && <ProgressBar />}</span>
        <span className="font-heading text-[clamp(13px,2.3vh,20px)] font-bold tracking-[-0.02em] text-ink" style={{ fontVariationSettings: '"wdth" 88, "opsz" 96' }}>{value}</span>
        <span className={`${mono} tracking-[0.18em] text-ink-2`}>{sub}</span>
      </div>
    </aside>
  );
}
