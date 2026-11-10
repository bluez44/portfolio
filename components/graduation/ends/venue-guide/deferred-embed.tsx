"use client";

import { useRef } from "react";
import { Loader2 } from "lucide-react";
import { useReadyWhenSettled } from "@/lib/hooks/use-ready-when-settled";
import { EMBED_NEAR_MARGIN, EMBED_SETTLE_MS } from "./constants";
import { EmbedFrame } from "./embed-frame";

/** Mounts the iframe once it is close and the visitor has stopped scrolling, so loading never janks a scroll. */
export function DeferredEmbed({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const ready = useReadyWhenSettled(ref, { rootMargin: EMBED_NEAR_MARGIN, settleMs: EMBED_SETTLE_MS });

  return (
    <div ref={ref} className="absolute inset-0 bg-paper-2">
      {ready ? (
        <EmbedFrame src={src} title={title} />
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
