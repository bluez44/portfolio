"use client";

import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { COMPACT_QUERY } from "./breakpoints";

/** True on phone widths. The server snapshot is false, so layout must not depend on it (use CSS). */
export function useCompactLayout(): boolean {
  return useMediaQuery(COMPACT_QUERY);
}
