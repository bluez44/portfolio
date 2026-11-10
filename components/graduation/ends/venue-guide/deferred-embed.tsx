"use client";

import { useRef } from "react";
import { useReadyWhenSettled } from "@/lib/hooks/use-ready-when-settled";
import { EMBED_NEAR_MARGIN, EMBED_SETTLE_MS } from "./constants";
import { EmbedFrame } from "./embed-frame";

/** Mounts the iframe once it is close and the visitor has stopped scrolling, so loading never janks a scroll. */
export function DeferredEmbed({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const ready = useReadyWhenSettled(ref, { rootMargin: EMBED_NEAR_MARGIN, settleMs: EMBED_SETTLE_MS });
  return (
    <div ref={ref} className="absolute inset-0">
      {ready && <EmbedFrame src={src} title={title} />}
    </div>
  );
}
