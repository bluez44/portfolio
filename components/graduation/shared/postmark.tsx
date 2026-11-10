// postmark.tsx: round rubber stamp (HCMUT postmark, "Admit One Guest")
import type { CSSProperties } from "react";
import type { RisoColor } from "@/lib/graduation/event";

export function Postmark({
  color,
  lines,
  rotate,
  className = "",
  style,
}: { color: RisoColor; lines: string[]; rotate: number; className?: string; style?: CSSProperties }) {
  return (
    <div
      aria-hidden
      className={`absolute grid h-23 w-23 place-items-center rounded-full border-[1.5px] text-center ${className}`}
      style={{ borderColor: `var(--${color})`, transform: `rotate(${rotate}deg)`, ...style }}
    >
      <span className="font-mono text-[9px] leading-normal tracking-[0.18em] uppercase" style={{ color: `var(--${color})` }}>
        {lines.map((l, i) => (
          <span key={i} className="block">{l}</span>
        ))}
      </span>
    </div>
  );
}
