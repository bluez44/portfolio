"use client";

import { HEX_POINTS, HEX_W, HEX_H } from "./honeycomb-layout";
import type { CellStyle, WishBee } from "./types";

const VIEWBOX = `0 0 ${HEX_W} ${HEX_H}`;

function HexSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={VIEWBOX} className="absolute inset-0 h-full w-full overflow-visible">
      {children}
    </svg>
  );
}

export function EmptyHex({ drop }: { drop: boolean }) {
  return (
    <>
      <HexSvg>
        <polygon
          points={HEX_POINTS}
          style={{
            fill: "color-mix(in oklab, var(--paper) 60%, transparent)",
            stroke: "color-mix(in oklab, var(--ink) 28%, transparent)",
            strokeWidth: 1.5,
            strokeDasharray: "4 5",
          }}
        />
      </HexSvg>
      {drop && (
        <span
          aria-hidden
          className="absolute top-1/2 left-1/2 -mt-1.5 -ml-2 box-border h-4 w-4 -rotate-45 border-[1.5px] border-ink bg-canary"
          style={{ borderRadius: "50% 0 50% 50%", boxShadow: "var(--offset-xs)" }}
        />
      )}
    </>
  );
}

export function HubHex({ count }: { count: number }) {
  return (
    <>
      <HexSvg>
        <polygon points={HEX_POINTS} transform="translate(5 5)" style={{ fill: "var(--ink)" }} />
        <polygon points={HEX_POINTS} style={{ fill: "var(--canary)", stroke: "var(--ink)", strokeWidth: 1.5 }} />
      </HexSvg>
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-[#1c1b1f]">
        <span
          className="font-heading leading-[0.9] font-bold tracking-[-0.04em]"
          style={{ fontSize: 44, fontVariationSettings: '"wdth" 80, "opsz" 96' }}
        >
          {count}
        </span>
        <span className="font-mono text-[9px] tracking-[0.22em] uppercase">Lời chúc</span>
      </span>
    </>
  );
}

export function WishHex({
  bee,
  style,
  onOpen,
}: {
  bee: WishBee;
  style: CellStyle;
  onOpen: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const tone = style === "tone";
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Lời chúc từ ${bee.name}`}
      title={bee.name}
      className="absolute inset-0 m-0 cursor-pointer border-none bg-transparent p-0 transition-transform duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5"
    >
      <HexSvg>
        <polygon points={HEX_POINTS} transform={tone ? "translate(4 4)" : "translate(5 5)"} style={{ fill: tone ? "var(--ink)" : bee.color }} />
        <polygon
          points={HEX_POINTS}
          style={{ fill: tone ? bee.color : "var(--paper)", stroke: "var(--ink)", strokeWidth: 1.5 }}
        />
        {tone && <polygon points={HEX_POINTS} fill="url(#hexDots)" />}
      </HexSvg>
      {tone ? (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5" style={{ color: bee.onColor }}>
          <span
            className="font-heading leading-[0.9] font-bold tracking-[-0.03em]"
            style={{ fontSize: 44, fontVariationSettings: '"wdth" 82, "opsz" 96' }}
          >
            {bee.init}
          </span>
          <span className="font-mono text-[9px] tracking-[0.18em]">{bee.date}</span>
        </span>
      ) : (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
          <span
            className="grid h-[46px] w-[46px] place-items-center rounded-full border-[1.5px] border-ink font-heading text-[22px] leading-none font-bold"
            style={{ background: bee.color, color: bee.onColor }}
          >
            {bee.init}
          </span>
          <span className="font-mono text-[9px] tracking-[0.18em] text-ink-2">{bee.date}</span>
        </span>
      )}
    </button>
  );
}
