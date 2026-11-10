"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

/** A full-bleed iframe for the venue guide frame with a loading spinner. */
export function EmbedFrame({ src, title, allow }: { src: string; title: string; allow?: string }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative h-full w-full bg-paper-2">
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2.5 bg-paper-2 text-ink-2"
        >
          <Loader2 className="h-7 w-7 animate-spin text-tomato" />
          <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-ink-3">
            Đang tải...
          </span>
        </div>
      )}
      <iframe
        src={src}
        title={title}
        allow={allow}
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => setIsLoading(false)}
        className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
