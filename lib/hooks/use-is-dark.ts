"use client";

import { useTheme } from "next-themes";
import { useHydrated } from "./use-hydrated";

export function useIsDark(): { dark: boolean; toggle: () => void } {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHydrated();
  const dark = mounted && resolvedTheme === "dark";
  return { dark, toggle: () => setTheme(dark ? "light" : "dark") };
}
