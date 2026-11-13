"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useReadyWhenSettled } from "@/lib/hooks/use-ready-when-settled";
import { GRADUATION_GATE_RESOURCES, useResourceGate } from "../../loading/resource-gate";
import { EMBED_NEAR_MARGIN, EMBED_SETTLE_MS } from "./constants";
import { EmbedFrame } from "./embed-frame";

/**
 * Mounts the iframe once it is close and the visitor has stopped scrolling, so
 * loading never janks a scroll — except while the page-level loading gate is
 * still up, when it mounts eagerly so the map is ready before the reveal.
 */
export function DeferredEmbed({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const settled = useReadyWhenSettled(ref, { rootMargin: EMBED_NEAR_MARGIN, settleMs: EMBED_SETTLE_MS });
  const gate = useResourceGate();
  // Never server-render the iframe: it could finish loading before hydration attaches onLoad.
  const hydrated = useHydrated();
  // Once mounted, never unmount again (gate.pending flips back to false).
  const [mounted, setMounted] = useState(false);
  if (!mounted && hydrated && (settled || gate?.pending)) setMounted(true);

  return (
    <div ref={ref} className="absolute inset-0 bg-paper-2">
      {mounted ? (
        <EmbedFrame src={src} title={title} onLoad={() => gate?.resolve(GRADUATION_GATE_RESOURCES.map)} />
      ) : (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 text-ink-3"
        >
          <Loader2 className="h-7 w-7 animate-spin text-tomato" />
          <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-ink-3">
            Đang chuẩn bị bản đồ...
          </span>
        </div>
      )}
    </div>
  );
}
