import type { CSSProperties } from "react";
import { focusPosition, type MomentFocus } from "@/lib/graduation/image-focus";

/** Pair with `focusVars` on the `<img>`: phones use `--focus-phone`, the wide layout (760px up) `--focus-wide`. */
export const FOCUS_CLASS = "object-(--focus-phone) min-[760px]:object-(--focus-wide)";

export const focusVars = (focus?: MomentFocus): CSSProperties =>
  ({ "--focus-phone": focusPosition(focus?.phone), "--focus-wide": focusPosition(focus?.wide) }) as CSSProperties;
