"use client";

import { useEffect, useRef } from "react";
import { RisoButton } from "@/components/ui/riso/button";
import { TicketWhen } from "../ends/ticket-when";
import { TicketWhere } from "../ends/ticket-where";
import { useCopy, useLang } from "../i18n/lang-context";
import { DownloadCardButton } from "../shared/download-card-button";

type Props = {
  guestName: string;
  /** The invitation can only be opened once the intro is ready. */
  canOpen: boolean;
  onBack: () => void;
  onOpen: () => void;
};

/** Date, time and venue on top of the intro, for guests who only need the details. */
export function QuickInfoPanel({ guestName, canOpen, onBack, onOpen }: Props) {
  const { gate: t, finale } = useCopy();
  const { guestId } = useLang();
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    backRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  return (
    <div role="dialog" aria-modal="true" aria-label={t.quickInfo} className="fixed inset-0 z-101 overflow-y-auto overscroll-contain bg-paper">
      <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-center gap-6 px-4 pt-[calc(env(safe-area-inset-top)+24px)] pb-[calc(env(safe-area-inset-bottom)+24px)] sm:px-6">
        <button
          ref={backRef}
          type="button"
          onClick={onBack}
          className="riso-focus hit-area relative cursor-pointer self-start border-0 bg-transparent px-0 py-1.5 font-mono text-[11px] tracking-[0.22em] text-ink-2 uppercase hover:text-tomato"
        >
          {t.quickBack}
        </button>
        <div className="grid grid-cols-1 rounded-[14px] border-[1.5px] border-ink bg-paper md:grid-cols-[4fr_6fr]" style={{ boxShadow: "var(--offset-lg)" }}>
          <TicketWhen />
          <TicketWhere />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {guestId && <DownloadCardButton guestId={guestId} guestName={guestName} label={finale.downloadCard} />}
          <RisoButton variant="primary" size="md" icon="→" disabled={!canOpen} onClick={onOpen} className="disabled:cursor-wait disabled:opacity-60">
            {canOpen ? t.quickOpen : t.beePreparing}
          </RisoButton>
        </div>
      </div>
    </div>
  );
}
