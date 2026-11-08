import type { ReactNode } from "react";
import type { RisoColor } from "@/lib/graduation/event";

type PillColor = RisoColor | "paper" | "paper-2";

export function RisoPill({
  color = "jade",
  tilt = 0,
  pulse = false,
  size = "md",
  children,
}: { color?: PillColor; tilt?: number; pulse?: boolean; size?: "md" | "sm"; children: ReactNode }) {
  const light = color === "canary" || color === "paper" || color === "paper-2";
  const sizeCls =
    size === "sm"
      ? "px-2.5 py-0.5 font-mono text-[10px] tracking-[0.18em]"
      : "px-4 py-1.5 font-sans text-[12px] font-semibold tracking-[0.16em]";
  return (
    <span
      role="status"
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-ink uppercase leading-[1.4] ${sizeCls}`}
      style={{
        background: `var(--${color})`,
        color: light ? "var(--ink)" : "var(--paper)",
        boxShadow: size === "sm" ? "2px 2px 0 var(--ink)" : "var(--offset-sm)",
        transform: tilt ? `rotate(${tilt}deg)` : undefined,
      }}
    >
      {pulse && (
        <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: light ? "var(--ink)" : "var(--paper)", animation: "pulse-dot 2.2s ease-in-out infinite" }} />
      )}
      {children}
    </span>
  );
}
