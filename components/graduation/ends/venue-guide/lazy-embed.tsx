"use client";

import { useState, type ReactNode } from "react";
import { RisoButton } from "@/components/ui/riso/button";

/**
 * Shows `poster` with a load button and only mounts the iframe once clicked: keeps the page light
 * and stops the embed from capturing the page's scroll until the visitor chooses to interact.
 * `data-lenis-prevent` lets the embed scroll/zoom without Lenis hijacking the wheel.
 */
export function LazyEmbed({
  src,
  title,
  loadLabel,
  allow,
  poster,
}: {
  src: string;
  title: string;
  loadLabel: string;
  allow?: string;
  poster: ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);
  if (loaded) {
    return (
      <iframe
        src={src}
        title={title}
        allow={allow}
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        data-lenis-prevent
        className="absolute inset-0 h-full w-full border-0"
      />
    );
  }
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div aria-hidden className="absolute inset-0">{poster}</div>
      <RisoButton variant="primary" size="md" icon="▶" onClick={() => setLoaded(true)} className="relative">
        {loadLabel}
      </RisoButton>
    </div>
  );
}
