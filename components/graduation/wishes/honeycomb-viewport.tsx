"use client";

import { useMemo, type MouseEvent, type ReactNode } from "react";
import { RisoIconButton } from "@/components/ui/riso/icon-button";
import { useCopy } from "../i18n/lang-context";
import { EmptyHex, HubHex, WishHex } from "./hex-cell";
import { buildHoneycomb, honeycombExtent, HEX_W, HEX_H, type HoneycombLayout } from "./honeycomb-layout";
import { usePanZoom } from "./use-pan-zoom";
import type { CellStyle, WishBee } from "./types";

export function HoneycombViewport({
  bees,
  layout,
  cellStyle,
  onOpen,
  overlay,
}: {
  bees: WishBee[];
  layout: HoneycombLayout;
  cellStyle: CellStyle;
  onOpen: (index: number, e: MouseEvent<HTMLButtonElement>) => void;
  /** status content (loading / error / empty) rendered above the comb */
  overlay?: ReactNode;
}) {
  const { wishes: t } = useCopy();
  const slots = useMemo(() => buildHoneycomb(layout, bees.length), [layout, bees.length]);
  const extent = useMemo(() => honeycombExtent(slots), [slots]);
  const { viewportRef, setTarget, zoomPct, zoomIn, zoomOut, reset, suppressClick, handlers } = usePanZoom(extent);
  const open = (i: number, e: MouseEvent<HTMLButtonElement>) => {
    if (!suppressClick.current) onOpen(i, e);
  };

  return (
    <div
      ref={viewportRef}
      {...handlers}
      className="relative box-border h-[clamp(440px,64vh,600px)] min-w-0 flex-[2_1_520px] cursor-grab touch-none overflow-hidden rounded-[14px] border-[1.5px] border-ink bg-paper-2 select-none"
      style={{ boxShadow: "6px 6px 0 var(--ink)" }}
    >
      <svg width="0" height="0" className="absolute">
        <defs>
          <pattern id="hexDots" width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="3.5" cy="3.5" r="1.2" fill="#fbf8f2" opacity="0.42" />
          </pattern>
        </defs>
      </svg>

      <div ref={setTarget} className="absolute top-1/2 left-1/2 h-0 w-0 origin-top-left">
        {/* dotted bee flight path behind the comb */}
        <svg
          viewBox="0 0 1040 940"
          className="pointer-events-none absolute overflow-visible"
          style={{ left: -520, top: -470, width: 1040, height: 940 }}
        >
          <path
            d="M 60 800 C 240 600, 120 380, 360 320 S 690 400, 760 210 S 950 80, 1010 150"
            fill="none"
            style={{
              stroke: "color-mix(in oklab, var(--ink) 30%, transparent)",
              strokeWidth: 2,
              strokeLinecap: "round",
              strokeDasharray: "0.1 10",
            }}
          />
        </svg>

        {slots.map((s, i) => (
          <div key={i} className="absolute" style={{ left: s.left, top: s.top, width: HEX_W, height: HEX_H }}>
            {s.kind === "empty" && <EmptyHex drop={s.drop} />}
            {s.kind === "hub" && <HubHex count={bees.length} label={t.count} />}
            {s.kind === "wish" && bees[s.wishIndex] && (
              <WishHex
                bee={bees[s.wishIndex]}
                style={cellStyle}
                isMine={bees[s.wishIndex].mine}
                mineLabel={t.mine}
                label={t.wishFrom(bees[s.wishIndex].name)}
                onOpen={(e) => open(s.wishIndex, e)}
              />
            )}
          </div>
        ))}
      </div>

      <div onPointerDown={(e) => e.stopPropagation()} className="absolute bottom-4 left-4 flex items-center gap-2">
        <RisoIconButton size="md" fill="paper" label={t.zoomOut} onClick={zoomOut}>
          −
        </RisoIconButton>
        <span className="min-w-13 rounded-full border-[1.5px] border-ink bg-paper px-2 py-1.5 text-center font-mono text-[11px] tracking-[0.12em] text-ink">
          {zoomPct}%
        </span>
        <RisoIconButton size="md" fill="paper" label={t.zoomIn} onClick={zoomIn}>
          +
        </RisoIconButton>
        <RisoIconButton size="md" fill="canary" label={t.recenter} onClick={reset}>
          ◉
        </RisoIconButton>
      </div>

      {overlay && <div className="absolute inset-0 grid place-items-center bg-paper-2/80">{overlay}</div>}
    </div>
  );
}
