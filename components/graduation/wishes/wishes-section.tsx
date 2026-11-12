"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { BEE_CARD_REVEAL_DELAY_MS, useCourierBee } from "../courier/courier-bee-provider";
import { SectionHeading } from "../shared/section-heading";
import { HoneycombViewport } from "./honeycomb-viewport";
import type { HoneycombLayout } from "./honeycomb-layout";
import { WishPostcard, WISH_CARD_ID } from "./wish-postcard";
import { wishAccent, type CardStyle, type CellStyle, type WishBee } from "./types";
import type { BeeWallEntry } from "@/app/api/bee-wall/route";

/** "idle" until the first answer arrives; a refetch keeps showing the current bees meanwhile. */
type LoadState = "idle" | "done" | "error";

const CELL_STYLE: CellStyle = "tone";
const LAYOUT: HoneycombLayout = "organic";
const CARD_STYLE: CardStyle = "index";

function toWishBee(row: BeeWallEntry, index: number): WishBee {
  const { name } = row;
  const d = new Date(row.at);
  const pad = (v: number) => String(v).padStart(2, "0");
  return {
    key: row.key,
    mine: row.mine,
    name,
    init: (name.split(" ")[1]?.[0] ?? name[0]).toUpperCase(),
    date: Number.isNaN(d.getTime()) ? "··.··" : `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`,
    msg: row.wish,
    ...wishAccent(index),
  };
}

/** The bee wall's wishes; `null` without a guest, since only invited guests may read the wall. */
async function requestBees(guestId?: string): Promise<WishBee[] | null> {
  if (!guestId) return null;
  const res = await fetch("/api/bee-wall", { headers: { Authorization: `Bearer ${guestId}` } });
  if (!res.ok) throw new Error("fetch failed");
  const data: BeeWallEntry[] = await res.json();
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
    requestBees(guestId).then(
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
  }, [visible, refreshKey, guestId]);

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
            layout={LAYOUT}
            cellStyle={CELL_STYLE}
            onOpen={(i, e) => {
              const r = e.currentTarget.getBoundingClientRect();
              flightOrigin.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
              setCardDelayMs(canFly() ? BEE_CARD_REVEAL_DELAY_MS : 0);
              setOpenIndex(i);
            }}
            overlay={overlay}
          />
        </div>
      </div>

      {openIndex != null && bees[openIndex] && (
        <WishPostcard
          bee={bees[openIndex]}
          index={openIndex}
          cardStyle={CARD_STYLE}
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
