"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  const pathname = usePathname();
  const isGraduation = pathname?.startsWith("/graduation");

  return (
    <NextThemesProvider
      {...props}
      forcedTheme={isGraduation ? "light" : undefined}
    >
      {children}
    </NextThemesProvider>
  );
}
