"use client";

import { useCallback, useState } from "react";

/** Whether the 360° tour is mounted; `close` bumps `key` so the embed remounts back to its poster. */
export function useTourSession() {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);

  const start = useCallback(() => setOpen(true), []);
  const close = useCallback(() => {
    setOpen(false);
    setKey((k) => k + 1);
  }, []);

  return { open, key, start, close };
}
