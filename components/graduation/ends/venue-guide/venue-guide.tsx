"use client";

import { useId, useState, type ReactNode } from "react";
import { GRADUATION_EVENT as E } from "@/lib/graduation/event";
import type { GuideTab } from "@/lib/graduation/i18n";
import { useCopy } from "../../i18n/lang-context";
import { MapPoster, TourPoster } from "./guide-posters";
import { GuideTabs, type GuideTabId } from "./guide-tabs";
import { LazyEmbed } from "./lazy-embed";

/** Permissions the 3DVista tour uses for full screen and device-orientation look-around. */
const TOUR_ALLOW = "fullscreen; accelerometer; gyroscope; magnetometer; xr-spatial-tracking";

type Panel = { id: GuideTabId; copy: GuideTab; src: string; openHref: string; allow?: string; poster: ReactNode };

/**
 * Map and 360° campus tour in one fixed-ratio frame. Both panels stay mounted (inactive ones are
 * hidden) so a loaded embed survives switching tabs; the fixed ratio means loading never shifts layout.
 */
export function VenueGuide() {
  const { ends } = useCopy();
  const t = ends.guide;
  const [active, setActive] = useState<GuideTabId>("map");
  const base = useId();
  const idFor = (id: GuideTabId) => ({ tab: `${base}-${id}-tab`, panel: `${base}-${id}-panel` });

  const panels: Panel[] = [
    { id: "map", copy: t.map, src: E.mapEmbedUrl, openHref: E.mapsUrl, poster: <MapPoster /> },
    { id: "tour", copy: t.tour, src: E.virtualTourUrl, openHref: E.virtualTourUrl, allow: TOUR_ALLOW, poster: <TourPoster /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 font-heading text-2xl leading-[1.05] font-bold tracking-tight" style={{ fontVariationSettings: '"wdth" 90, "opsz" 96' }}>
        {t.title}
      </h3>
      <GuideTabs
        tabs={panels.map((p) => ({ id: p.id, label: p.copy.tab }))}
        active={active}
        label={t.tabsLabel}
        idFor={idFor}
        onSelect={setActive}
      />
      {panels.map((p) => (
        <div key={p.id} id={idFor(p.id).panel} role="tabpanel" aria-labelledby={idFor(p.id).tab} hidden={p.id !== active} className="flex flex-col gap-2.5">
          <div
            className="relative aspect-4/3 overflow-hidden rounded-[14px] border-[1.5px] border-ink bg-paper-2 min-[760px]:aspect-16/10"
            style={{ boxShadow: "var(--offset-md)" }}
          >
            <LazyEmbed src={p.src} title={p.copy.frameTitle} loadLabel={p.copy.load} allow={p.allow} poster={p.poster} />
          </div>
          <a
            href={p.openHref}
            target="_blank"
            rel="noopener noreferrer"
            className="riso-focus self-end font-mono text-[11px] tracking-[0.18em] text-ink-2 uppercase underline underline-offset-4 hover:text-tomato"
          >
            {p.copy.open} ↗
          </a>
        </div>
      ))}
    </div>
  );
}
