// tape.tsx: washi-tape strip
import type { CSSProperties } from "react";

export function Tape({
  color,
  width,
  height,
  rotate,
  className = "",
  style,
}: { color: string; width: number; height: number; rotate: number; className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      className={`absolute left-1/2 ${className}`}
      style={{
        width,
        height,
        marginLeft: -width / 2,
        transform: `rotate(${rotate}deg)`,
        background: `color-mix(in oklab, var(--${color}) 75%, transparent)`,
        backgroundImage: "var(--stripes-tape)",
        ...style,
      }}
    />
  );
}
