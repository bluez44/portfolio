"use client";

import { useEffect, type RefObject } from "react";
import { useIsDark } from "@/lib/hooks/use-is-dark";
import { readRisoPalette, type RisoPalette } from "./palette";

export type Repaintable = { applyPalette(p: RisoPalette): void };

/** Repaints a 3D scene when the theme flips; waits a frame so the new tokens have been applied. */
export function usePaletteSync(ref: RefObject<Repaintable | null>) {
  const { dark } = useIsDark();
  useEffect(() => {
    const id = requestAnimationFrame(() => ref.current?.applyPalette(readRisoPalette()));
    return () => cancelAnimationFrame(id);
  }, [dark, ref]);
}
