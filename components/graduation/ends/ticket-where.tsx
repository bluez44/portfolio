"use client";

import { RisoButton } from "@/components/ui/riso/button";
import { downloadTextFile } from "@/lib/browser/download-text-file";
import { GRADUATION_EVENT as E } from "@/lib/graduation/event";
import { buildIcs } from "@/lib/graduation/ics";
import { useCopy } from "../i18n/lang-context";

export function TicketWhere() {
  const { ends: t } = useCopy();
  const addToCalendar = () =>
    downloadTextFile("tot-nghiep-quang-vinh.ics", "text/calendar", buildIcs(E, new Date()));

  return (
    <div className="flex flex-col gap-3.5 px-7 py-8">
      <span className="font-mono text-[10px] tracking-[0.22em] text-ink-3 uppercase">{t.where}</span>
      <span className="font-heading text-[clamp(26px,2.6vw,34px)] leading-[1.02] font-bold tracking-[-0.03em]" style={{ fontVariationSettings: '"wdth" 88, "opsz" 96' }}>
        {t.venue}
      </span>
      <span className="text-[15px] leading-[1.6] text-ink-2">
        {E.address}
        <br />
        <span className="text-ink-3 italic">{t.venueSub}</span>
      </span>
      <div className="mt-1.5 flex flex-wrap gap-3">
        <RisoButton variant="primary" size="md" href={E.mapsUrl} target="_blank" rel="noopener noreferrer" icon="↗">
          {t.directions}
        </RisoButton>
        <RisoButton variant="secondary" size="md" onClick={addToCalendar} icon="↓">
          {t.addToCalendar}
        </RisoButton>
      </div>
    </div>
  );
}
