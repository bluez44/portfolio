import type { CSSProperties } from "react";

/** Where a cropped photo is anchored (its CSS `object-position`), on a 3×3 grid. */
export const IMAGE_FOCI = ["top-left", "top", "top-right", "left", "center", "right", "bottom-left", "bottom", "bottom-right"] as const;
export type ImageFocus = (typeof IMAGE_FOCI)[number];

/** A moment photo's anchor on phones and on wide screens; either falls back to the centre. */
export type MomentFocus = { phone?: ImageFocus; wide?: ImageFocus };

const AXIS = { left: "0%", top: "0%", right: "100%", bottom: "100%" } as const;

export function focusPosition(focus: ImageFocus = "center"): string {
  if (focus === "center") return "50% 50%";
  const [first, second] = focus.split("-") as (keyof typeof AXIS)[];
  const vertical = first === "top" || first === "bottom" ? first : undefined;
  const horizontal = second ?? (vertical ? undefined : first);
  return `${horizontal ? AXIS[horizontal] : "50%"} ${vertical ? AXIS[vertical] : "50%"}`;
}

/** Pair with `FOCUS_CLASS` on the `<img>`: phones use `--focus-phone`, the 760px layout up `--focus-wide`. */
export const focusVars = (focus?: MomentFocus): CSSProperties =>
  ({ "--focus-phone": focusPosition(focus?.phone), "--focus-wide": focusPosition(focus?.wide) }) as CSSProperties;

export const FOCUS_CLASS = "object-(--focus-phone) min-[760px]:object-(--focus-wide)";
