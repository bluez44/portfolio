import type { ButtonHTMLAttributes } from "react";
import type { RisoColor } from "@/lib/graduation/event";

const SIZE = { lg: 44, md: 36, sm: 32, xs: 24 } as const;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: keyof typeof SIZE;
  fill?: "paper" | RisoColor;
  label: string;
  isPlaying?: boolean;
};

export function RisoIconButton({ size = "md", fill = "paper", label, className = "", style, children, isPlaying, ...rest }: Props) {
  const d = SIZE[size];
  const light = fill === "paper" || fill === "canary";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={`riso-focus hit-area relative grid flex-none cursor-pointer place-items-center rounded-full border-[1.5px] border-ink p-0 font-heading font-bold leading-none transition-transform duration-(--dur-fast) hover:-translate-y-0.5 ${className} ${isPlaying ? "animate-spin" : ""}`}
      style={{
        width: d,
        height: d,
        fontSize: d >= 36 ? 14 : 11,
        background: `var(--${fill})`,
        color: light ? "var(--ink)" : "var(--paper)",
        boxShadow: isPlaying
          ? "var(--offset-rounded)"
          : "var(--offset-xs)",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
