import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import type { RisoColor } from "@/lib/graduation/event";

type Variant = "primary" | "secondary" | "ink";
type Size = "lg" | "md" | "sm";

const VARIANT: Record<Variant, string> = {
  primary: "bg-tomato text-paper",
  secondary: "bg-paper text-ink",
  ink: "bg-ink text-paper",
};
/** Offset-shadow colour per variant; never the same as the fill, or the shadow disappears. */
const OFFSET: Record<Variant, RisoColor | "ink"> = { primary: "ink", secondary: "blue", ink: "blue" };
const SIZE: Record<Size, { cls: string; off: number }> = {
  lg: { cls: "gap-2.5 px-7 py-3.5 text-[15px]", off: 5 },
  md: { cls: "gap-2 px-5 py-2.5 text-[13px]", off: 4 },
  sm: { cls: "gap-2 px-4.5 py-2 text-[13px]", off: 3 },
};

type Common = { variant?: Variant; size?: Size; icon?: ReactNode; offsetColor?: RisoColor | "ink"; children: ReactNode };
type AsButton = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function RisoButton(props: AsButton | AsLink) {
  const { variant = "primary", size = "lg", icon, offsetColor, children, className = "", style, ...rest } = props;
  const s = SIZE[size];
  const oc = offsetColor ?? OFFSET[variant];
  const cls = `riso-btn riso-focus inline-flex items-center rounded-full border-[1.5px] border-ink font-sans font-semibold leading-[1.2] no-underline ${VARIANT[variant]} ${s.cls} ${className}`;
  const vars = { "--off": `${s.off}px`, "--off-color": `var(--${oc})`, ...style } as CSSProperties;
  const content = (
    <>
      {children}
      {icon ? <span aria-hidden>{icon}</span> : null}
    </>
  );
  if (rest.href !== undefined) {
    return <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} className={cls} style={vars}>{content}</a>;
  }
  return <button type="button" {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} className={cls} style={vars}>{content}</button>;
}
