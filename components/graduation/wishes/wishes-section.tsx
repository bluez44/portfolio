"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { beeAlias } from "@/lib/bee-alias";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { useCourierBee } from "../courier/courier-bee-provider";
import { SectionHeading } from "../shared/section-heading";
import { SectionKicker } from "../shared/section-kicker";
import { HoneycombViewport } from "./honeycomb-viewport";
import type { HoneycombLayout } from "./honeycomb-layout";
import { BEE_CARD_REVEAL_DELAY_MS } from "./use-bee-flight";
import { WishOptions, type OptionGroup } from "./wish-options";
import { WishPostcard, WISH_CARD_ID } from "./wish-postcard";
import { wishAccent, type CardStyle, type CellStyle, type WishBee } from "./types";

type ApiBee = { id: string; wish: string; at: string };
/** "idle" until the first answer arrives; a refetch keeps showing the current bees meanwhile. */
type LoadState = "idle" | "done" | "error";

function toWishBee(row: ApiBee, index: number): WishBee {
  const name = beeAlias(row.id);
  const d = new Date(row.at);
  const pad = (v: number) => String(v).padStart(2, "0");
  return {
    id: row.id,
    name,
    init: (name.split(" ")[1]?.[0] ?? name[0]).toUpperCase(),
    date: Number.isNaN(d.getTime()) ? "··.··" : `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`,
    msg: row.wish,
    ...wishAccent(index),
  };
}

/** The bee wall's wishes; `null` when the wall is not configured on this deployment. */
async function requestBees(): Promise<WishBee[] | null> {
  const secret = process.env.NEXT_PUBLIC_BEE_WALL_SECRET;
  if (!secret) return null;
  const res = await fetch("/api/bee-wall", { headers: { Authorization: `Bearer ${secret}` } });
  if (!res.ok) throw new Error("fetch failed");
  const data: ApiBee[] = await res.json();
  return data.map(toWishBee);
}

function StatusNote({ tone, children }: { tone?: "error"; children: string }) {
  return (
    <p
      className={`m-0 font-mono text-[12px] tracking-[0.2em] uppercase ${
        tone === "error" ? "text-tomato" : "animate-pulse text-ink-3"
      }`}
    >
      {children}
    </p>
  );
}

export function WishesSection({
  guestId,
  refreshKey,
}: {
  guestId?: string;
  refreshKey?: unknown;
} = {}) {
  const headerRef = useScrollReveal<HTMLDivElement>();
  const sectionRef = useRef<HTMLElement>(null);

  const [bees, setBees] = useState<WishBee[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [cellStyle, setCellStyle] = useState<CellStyle>("tone");
  const [layout, setLayout] = useState<HoneycombLayout>("organic");
  const [cardStyle, setCardStyle] = useState<CardStyle>("index");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [cardDelayMs, setCardDelayMs] = useState(0);
  const { canFly, flyOpen, flyAway } = useCourierBee();
  const flightOrigin = useRef<{ x: number; y: number } | null>(null);

  // The postcard is in the DOM (clipped shut) once openIndex is set, so the
  // bee can measure its landing spot and start flying.
  useEffect(() => {
    const from = flightOrigin.current;
    if (openIndex == null || !from) return;
    flightOrigin.current = null;
    flyOpen(from, WISH_CARD_ID);
  }, [openIndex, flyOpen]);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          setVisible(true);
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Fetch once the wall scrolls into view, and again whenever a new RSVP bumps `refreshKey`.
  useEffect(() => {
    if (!visible) return;
    let stale = false;
    requestBees().then(
      (next) => {
        if (stale || !next) return;
        setBees(next);
        setLoadState("done");
      },
      () => {
        if (!stale) setLoadState("error");
      },
    );
    return () => {
      stale = true;
    };
  }, [visible, refreshKey]);

  const overlay = useMemo(() => {
    if (loadState === "idle")
      return <StatusNote>[ đàn ong đang mang mật về tổ… ]</StatusNote>;
    if (loadState === "error") return <StatusNote tone="error">[ không thể kết nối tới tổ ong lúc này ]</StatusNote>;
    if (bees.length === 0)
      return (
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-3xl">🐝</span>
          <StatusNote>[ tổ ong đang chờ những lời chúc đầu tiên ]</StatusNote>
        </div>
      );
    return null;
  }, [loadState, bees.length]);

  const groups: OptionGroup[] = [
    {
      label: "Ô lục giác · Cell",
      value: cellStyle,
      options: [
        { value: "ink", label: "Viền mực" },
        { value: "tone", label: "Halftone" },
      ],
      onChange: (v) => setCellStyle(v as CellStyle),
    },
    {
      label: "Bố cục · Layout",
      value: layout,
      options: [
        { value: "ring", label: "Đồng tâm" },
        { value: "organic", label: "Hữu cơ" },
      ],
      onChange: (v) => setLayout(v as HoneycombLayout),
    },
    {
      label: "Bưu thiếp · Postcard",
      value: cardStyle,
      options: [
        { value: "air", label: "Airmail" },
        { value: "index", label: "Thẻ index" },
      ],
      onChange: (v) => setCardStyle(v as CardStyle),
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="bee-wall"
      className="relative border-t-[1.5px] border-ink bg-paper px-6 py-[clamp(80px,10vw,140px)] min-[760px]:px-[clamp(72px,8vw,128px)]"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div ref={headerRef} className="flex flex-col gap-5">
          <SectionHeading lead="Một tổ ong" accent="lời chúc." />
          <p className="m-0 max-w-[52ch] text-[17px] leading-[1.72] text-ink-2" style={{ textWrap: "pretty" }}>
            Mỗi ô là một lời nhắn gửi tới mình. Bấm vào một ô — một chú ong sẽ mang lời chúc đến cho bạn.{" "}
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-10">
          <HoneycombViewport
            bees={bees}
            layout={layout}
            cellStyle={cellStyle}
            guestId={guestId}
            onOpen={(i, e) => {
              const r = e.currentTarget.getBoundingClientRect();
              flightOrigin.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
              setCardDelayMs(canFly() ? BEE_CARD_REVEAL_DELAY_MS : 0);
              setOpenIndex(i);
            }}
            overlay={overlay}
          />
          {/* <WishOptions groups={groups} /> */}
        </div>
      </div>

      {openIndex != null && bees[openIndex] && (
        <WishPostcard
          bee={bees[openIndex]}
          index={openIndex}
          cardStyle={cardStyle}
          entranceDelayMs={cardDelayMs}
          onClose={() => {
            flyAway();
            setOpenIndex(null);
          }}
        />
      )}
    </section>
  );
}
