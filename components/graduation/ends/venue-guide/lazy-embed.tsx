"use client";

import { useState, type ReactNode } from "react";
import { RisoButton } from "@/components/ui/riso/button";
import { EmbedFrame } from "./embed-frame";

/**
 * Shows `poster` with a load button and only mounts the iframe once clicked. Used for the 360° tour,
 * which is heavy and turns drags into look-around, so it must not load (and trap touch scrolling) by itself.
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
  if (loaded) return <EmbedFrame src={src} title={title} allow={allow} />;
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div aria-hidden className="absolute inset-0">{poster}</div>
      <RisoButton variant="primary" size="md" icon="▶" onClick={() => setLoaded(true)} className="relative">
        {loadLabel}
      </RisoButton>
    </div>
  );
}
