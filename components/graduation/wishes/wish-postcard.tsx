"use client";

import { useEffect, useRef } from "react";
import { RisoIconButton } from "@/components/ui/riso/icon-button";
import { useCopy } from "../i18n/lang-context";
import type { CardStyle, WishBee } from "./types";

function AirmailCard({ bee, n }: { bee: WishBee; n: string }) {
  const { wishes: t, envelope } = useCopy();
  return (
    <div
      className="box-border rounded-lg border-[1.5px] border-ink p-2.5"
      style={{
        boxShadow: "var(--offset-lg)",
        background:
          "repeating-linear-gradient(-45deg, var(--tomato) 0 14px, var(--paper) 14px 28px, var(--blue) 28px 42px, var(--paper) 42px 56px)",
      }}
    >
      <div className="flex flex-wrap gap-6 rounded border-[1.5px] border-ink bg-paper p-[clamp(20px,3vw,30px)]">
        <div className="flex flex-[3_1_240px] flex-col gap-4">
          <span className="font-mono text-[10px] tracking-[0.26em] text-blue uppercase">{t.airMail(n)}</span>
          <p
            className="m-0 font-heading font-semibold tracking-[-0.015em] text-ink"
            style={{ fontSize: "clamp(19px,2.2vw,23px)", lineHeight: 1.38, textWrap: "pretty" }}
          >
            {bee.msg}
          </p>
          <div className="mt-auto flex flex-col gap-1">
            <span className="font-heading text-lg font-bold text-ink">— {bee.name}</span>
            <span className="font-mono text-[10px] tracking-[0.18em] text-ink-3 uppercase">{envelope.guest}</span>
          </div>
        </div>
        <div className="flex flex-[2_1_170px] flex-col gap-[18px] border-l-[1.5px] border-dashed border-ink pl-[22px]">
          <div className="relative h-24">
            <div
              className="absolute top-0 right-0 box-border flex h-[82px] w-[68px] flex-col items-center justify-center gap-0.5 border-[1.5px] border-ink"
              style={{
                background: bee.color,
                color: bee.onColor,
                boxShadow: "var(--offset-sm)",
                outline: "3px dotted var(--paper)",
                outlineOffset: -7,
              }}
            >
              <span className="font-heading text-[28px] leading-none font-bold">{bee.init}</span>
              <span className="font-mono text-[9px] tracking-[0.18em]">2026</span>
            </div>
            <div className="absolute top-1.5 right-[52px] grid h-[84px] w-[84px] -rotate-12 place-items-center rounded-full border-[1.5px] border-tomato text-center">
              <span className="font-mono text-[9px] leading-[1.5] tracking-[0.16em] text-tomato uppercase">
                TP.HCM
                <br />· {bee.date} ·
                <br />
                2026
              </span>
            </div>
          </div>
          {[
            [t.to, "Võ Lê Quang Vinh"],
            [t.from, bee.name],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="font-mono text-[10px] tracking-[0.22em] text-ink-3 uppercase">{label}</span>
              <span className="border-b-[1.5px] border-dashed border-ink pb-1.5 font-heading text-lg font-bold text-ink">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IndexCard({ bee }: { bee: WishBee }) {
  const { envelope } = useCopy();
  const padX = "clamp(22px,3.4vw,34px)";
  return (
    <div
      className="relative box-border rounded-[14px] border-[1.5px] border-ink pb-7"
      style={{
        boxShadow: `6px 6px 0 ${bee.color}`,
        backgroundColor: "var(--paper)",
        backgroundImage:
          "repeating-linear-gradient(to bottom, transparent 0 35px, color-mix(in oklab, var(--blue) 22%, transparent) 35px 36px)",
        padding: `0 ${padX} 28px`,
      }}
    >
      <span
        aria-hidden
        className="absolute -top-3 left-1/2 -ml-12 h-[22px] w-24 -rotate-3"
        style={{
          background: `color-mix(in oklab, ${bee.color} 75%, transparent)`,
          backgroundImage: "var(--stripes-tape)",
        }}
      />
      <div
        className="box-border flex h-[72px] items-end justify-end rounded-t-[14px] border-b-[1.5px] border-tomato bg-paper pb-3"
        style={{ margin: `0 calc(-1 * ${padX})`, paddingLeft: padX, paddingRight: padX }}
      >
        {/* <span className="font-mono text-[11px] tracking-[0.24em] text-ink uppercase">Card · {n}</span> */}
        <span className="font-mono text-[11px] tracking-[0.18em] text-ink-2">{bee.date}.2026</span>
      </div>
      <p
        className="m-0 pt-1.5 font-heading font-semibold tracking-[-0.015em] text-ink"
        style={{ fontSize: "clamp(19px,2.2vw,23px)", lineHeight: "36px", textWrap: "pretty" }}
      >
        {bee.msg}
      </p>
      <div className="mt-5 flex items-center gap-3 bg-paper pt-2.5">
        <span
          className="grid h-[42px] w-[42px] place-items-center rounded-full border-[1.5px] border-ink font-heading text-xl leading-none font-bold"
          style={{ background: bee.color, color: bee.onColor }}
        >
          {bee.init}
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="font-heading text-[17px] font-bold text-ink">{bee.name}</span>
          <span className="font-mono text-[10px] tracking-[0.18em] text-ink-3 uppercase">{envelope.guest}</span>
        </div>
      </div>
    </div>
  );
}

export const WISH_CARD_ID = "wish-postcard";

export function WishPostcard({
  bee,
  index,
  cardStyle,
  onClose,
  entranceDelayMs = 0,
}: {
  bee: WishBee;
  index: number;
  cardStyle: CardStyle;
  onClose: () => void;
  /** holds the card clipped shut while the courier bee flies in */
  entranceDelayMs?: number;
}) {
  const { wishes: t } = useCopy();
  const n = String(index + 1).padStart(2, "0");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-60 animate-[wish-fade_0.45s_ease_both]"
        style={{ background: "rgba(20,18,14,0.6)" }}
      />
      <div className="pointer-events-none fixed inset-0 z-61 grid place-items-center p-6">
        <div
          ref={cardRef}
          id={WISH_CARD_ID}
          role="dialog"
          aria-modal="true"
          aria-label={t.wishFrom(bee.name)}
          className="pointer-events-auto relative w-[min(620px,100%)] animate-[wish-pop_0.75s_cubic-bezier(0.22,1,0.36,1)_both]"
          style={{ animationDelay: `${entranceDelayMs}ms` }}
        >
          <div className="absolute -top-3.5 -right-3.5 z-2">
            <RisoIconButton size="md" fill="paper" label={t.close} onClick={onClose}>
              ✕
            </RisoIconButton>
          </div>
          {cardStyle === "index" ? <IndexCard bee={bee} /> : <AirmailCard bee={bee} n={n} />}
        </div>
      </div>
    </>
  );
}
