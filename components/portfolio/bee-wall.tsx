"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { beeAlias } from "@/lib/bee-alias";

type Bee = { id: string; wish: string };

/**
 * Design system palette - Restrained Riso tokens
 * Honeycomb uses warm canary as dominant honey tones mixed with paper/accent trims.
 */
const CELL_PALETTES = [
  {
    bg: "var(--canary)",
    fg: "var(--ink)",
    border: "var(--ink)",
    shadow: "var(--offset-sm)",
    accentVar: "canary",
  },
  {
    bg: "var(--paper)",
    fg: "var(--ink)",
    border: "var(--ink)",
    shadow: "3px 3px 0 var(--canary)",
    accentVar: "canary",
  },
  {
    bg: "color-mix(in oklab, var(--canary) 22%, var(--paper))",
    fg: "var(--ink)",
    border: "var(--ink)",
    shadow: "var(--offset-sm)",
    accentVar: "tomato",
  },
  {
    bg: "var(--paper)",
    fg: "var(--ink)",
    border: "var(--ink)",
    shadow: "3px 3px 0 var(--tomato)",
    accentVar: "tomato",
  },
  {
    bg: "var(--paper)",
    fg: "var(--ink)",
    border: "var(--ink)",
    shadow: "3px 3px 0 var(--jade)",
    accentVar: "jade",
  },
  {
    bg: "var(--paper)",
    fg: "var(--ink)",
    border: "var(--ink)",
    shadow: "3px 3px 0 var(--blue)",
    accentVar: "blue",
  },
] as const;

type Palette = (typeof CELL_PALETTES)[number];

// ─── Individual hexagonal cell ───────────────────────────────────────────────

function BeeCell({
  bee,
  palette,
  onClick,
}: {
  bee: Bee;
  palette: Palette;
  onClick: (bee: Bee, palette: Palette) => void;
}) {
  const alias = beeAlias(bee.id);

  return (
    <button
      type="button"
      onClick={() => onClick(bee, palette)}
      title={alias}
      aria-label={`${alias} — xem lời chúc`}
      className="group relative flex flex-col items-center justify-center gap-1.5 p-2 transition-all duration-200 hover:-translate-y-1 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      style={{
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        width: "clamp(92px, 12vw, 124px)",
        aspectRatio: "1 / 1.1547",
        background: palette.bg,
        cursor: "pointer",
        filter: "drop-shadow(0 2px 0 var(--ink))",
      }}
    >
      {/* Riso-style inner stroke/edge outline */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 transition-opacity group-hover:opacity-80"
        style={{
          clipPath: "inherit",
          boxShadow: "inset 0 0 0 1.5px var(--ink)",
        }}
      />

      {/* Bee nickname */}
      <span
        className="max-w-[85%] text-center font-mono font-medium leading-tight text-ink"
        style={{
          fontSize: "clamp(9px, 1.1vw, 11px)",
          letterSpacing: "0.04em",
        }}
      >
        {alias}
      </span>
    </button>
  );
}

// ─── Popover / wish card ──────────────────────────────────────────────────────

function WishPopover({
  bee,
  palette,
  onClose,
}: {
  bee: Bee;
  palette: Palette;
  onClose: () => void;
}) {
  const alias = beeAlias(bee.id);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "color-mix(in oklab, var(--ink) 45%, transparent)" }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={`Lời chúc từ ${alias}`}
        className="relative w-full max-w-sm rounded-[14px] border-[1.5px] border-ink bg-paper p-7 pt-9"
        style={{ boxShadow: `8px 8px 0 var(--${palette.accentVar})` }}
      >
        {/* Decorative corner tag / seal */}
        <span
          aria-hidden
          className="absolute -top-5 left-1/2 -translate-x-1/2 grid h-11 w-11 place-items-center rounded-full border-[1.5px] border-ink bg-paper text-xl shadow-[2px_2px_0_var(--ink)]"
        >
          🐝
        </span>

        {/* Alias header */}
        <div className="flex flex-col items-center gap-1">
          <p className="font-mono text-[10px] font-bold tracking-[0.24em] text-ink-2 uppercase">
            Lời chúc từ
          </p>
          <h3
            className="font-heading font-bold text-ink"
            style={{ fontSize: "1.25rem", fontVariationSettings: '"wdth" 90' }}
          >
            {alias}
          </h3>
        </div>

        {/* Dotted riso separator */}
        <div className="my-5 border-b-[1.5px] border-dashed border-ink/30" />

        {/* Wish content */}
        <blockquote className="relative text-center text-[15px] leading-[1.7] text-ink">
          <span
            aria-hidden
            className="select-none font-heading text-2xl text-tomato"
          >
            “
          </span>
          {bee.wish}
          <span
            aria-hidden
            className="select-none font-heading text-2xl text-tomato"
          >
            ”
          </span>
        </blockquote>

        {/* Close button with riso offset button style */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute -top-3 -right-3 grid h-8 w-8 place-items-center rounded-full border-[1.5px] border-ink bg-paper text-[13px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-canary"
          style={{ boxShadow: "2px 2px 0 var(--ink)" }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── Honeycomb grid ───────────────────────────────────────────────────────────

function HoneycombGrid({
  bees,
  onCellClick,
}: {
  bees: Bee[];
  onCellClick: (bee: Bee, palette: Palette) => void;
}) {
  return (
    <div
      className="flex flex-wrap justify-center py-4"
      style={{
        // gap: "clamp(6px, 1.2vw, 12px)",
      }}
    >
      {bees.map((bee, i) => {
        const palette = CELL_PALETTES[i % CELL_PALETTES.length];
        return (
          <div key={bee.id} className="transition-transform duration-200">
            <BeeCell bee={bee} palette={palette} onClick={onCellClick} />
          </div>
        );
      })}
    </div>
  );
}

// ─── Main section component ───────────────────────────────────────────────────

type LoadState = "idle" | "loading" | "done" | "error";

export function BeeWall() {
  const headerRef = useScrollReveal<HTMLDivElement>();
  const gridRef = useScrollReveal<HTMLDivElement>();

  const [bees, setBees] = useState<Bee[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [active, setActive] = useState<{ bee: Bee; palette: Palette } | null>(null);

  const sectionRef = useRef<HTMLElement>(null);

  const fetchBees = useCallback(async () => {
    const secret = process.env.NEXT_PUBLIC_BEE_WALL_SECRET;
    if (!secret) return;
    setLoadState("loading");
    try {
      const res = await fetch("/api/bee-wall", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (!res.ok) throw new Error("fetch failed");
      const data: Bee[] = await res.json();
      setBees(data);
      setLoadState("done");
    } catch {
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          fetchBees();
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchBees]);

  const handleClose = useCallback(() => setActive(null), []);
  const handleCellClick = useCallback((bee: Bee, palette: Palette) => {
    setActive({ bee, palette });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="bee-wall"
      className="relative border-t-[1.5px] border-ink px-6 py-[clamp(80px,10vw,140px)] min-[760px]:px-[clamp(72px,8vw,128px)]"
      style={{ background: "var(--paper)" }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Section header consistent with Restrained Riso theme */}
        <div ref={headerRef} className="mb-12 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] tracking-[0.28em] text-ink-2 uppercase">
              Lời chúc · Bee Wall
            </span>
            <span aria-hidden className="h-px flex-1 max-w-40 bg-ink/20" />
          </div>

          <h2
            className="m-0 font-heading font-bold leading-[0.95] tracking-[-0.035em] text-ink"
            style={{
              fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)",
              fontVariationSettings: '"wdth" 90, "opsz" 96',
            }}
          >
            Những lời từ{" "}
            <span
              className="italic text-tomato"
              style={{ fontVariationSettings: '"wdth" 82' }}
            >
              tổ ong.
            </span>
          </h2>
          <p className="m-0 max-w-[50ch] text-[17px] leading-[1.72] text-ink-2">
            Mỗi chú ong mang theo một lời chúc gửi tặng. Nhấp vào từng ô để mở lời chúc nhé!
          </p>
        </div>

        {/* Honeycomb stage framed inside a paper card */}
        <div
          ref={gridRef}
          className="relative min-h-[220px] rounded-[14px] border-[1.5px] border-ink bg-paper-2 p-6 sm:p-10"
          style={{ boxShadow: "var(--offset-lg)" }}
        >
          {loadState === "loading" && (
            <div className="flex min-h-[160px] items-center justify-center">
              <p className="font-mono text-[12px] tracking-[0.2em] text-ink-3 uppercase animate-pulse">
                [ đàn ong đang mang mật về tổ… ]
              </p>
            </div>
          )}

          {loadState === "error" && (
            <div className="flex min-h-[160px] items-center justify-center">
              <p className="font-mono text-[12px] text-tomato">
                [ không thể kết nối tới tổ ong lúc này ]
              </p>
            </div>
          )}

          {loadState === "done" && bees.length === 0 && (
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 text-center">
              <span className="text-3xl">🐝</span>
              <p className="font-mono text-[12px] tracking-[0.16em] text-ink-3 uppercase">
                [ tổ ong đang chờ những lời chúc đầu tiên ]
              </p>
            </div>
          )}

          {loadState === "done" && bees.length > 0 && (
            <HoneycombGrid bees={bees} onCellClick={handleCellClick} />
          )}
        </div>
      </div>

      {/* Popover modal */}
      {active && (
        <WishPopover
          bee={active.bee}
          palette={active.palette}
          onClose={handleClose}
        />
      )}
    </section>
  );
}
