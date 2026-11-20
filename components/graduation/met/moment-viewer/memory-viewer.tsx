"use client";

import { useCallback, useState } from "react";
import type { Moment } from "@/lib/graduation/i18n";
import { useCopy } from "../../i18n/lang-context";
import { MomentViewer } from "./moment-viewer";

/** What a tapped finale memory opens: a moment (by its index in the timeline) or the together photo. */
export type MemoryTarget = { kind: "moment"; index: number } | { kind: "together" };

export function useMemoryViewer() {
  const [state, setState] = useState<MemoryTarget | null>(null);
  const close = useCallback(() => setState(null), []);
  return { state, open: setState, close };
}

type Props = { state: MemoryTarget | null; moments: Moment[]; together?: string; guestName: string; onClose: () => void };

export function MemoryViewer({ state, moments, together, guestName, onClose }: Props) {
  const { met: t } = useCopy();
  if (!state || (state.kind === "together" && !together)) return null;
  return (
    <MomentViewer
      moments={moments}
      together={together ? { image: together, caption: t.togetherCaption(guestName) } : undefined}
      startIndex={state.kind === "moment" ? state.index : moments.length}
      copy={t.carousel}
      onClose={onClose}
    />
  );
}
