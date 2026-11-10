"use client";

import { useId, type ReactNode, type Ref } from "react";
import { GRADUATION_EVENT as E } from "@/lib/graduation/event";
import type { GuideTab } from "@/lib/graduation/i18n";
import { useCopy } from "../../i18n/lang-context";
import { EmbedFrame } from "./embed-frame";
import { TourPoster } from "./tour-poster";
import { GuideTabs, type GuideTabId } from "./guide-tabs";
import { LazyEmbed } from "./lazy-embed";

/** Permissions the 3DVista tour uses for full screen and device-orientation look-around. */
const TOUR_ALLOW = "fullscreen; accelerometer; gyroscope; magnetometer; xr-spatial-tracking";

type Panel = { id: GuideTabId; copy: GuideTab; frame: ReactNode; external?: { href: string; label: string } };

/**
 * Map and 360° campus tour in one fixed-ratio frame. The map renders straight away (lazy-loaded by
 * the browser); the tour waits for a click. Both panels stay mounted (inactive ones are hidden) so a
 * loaded embed survives switching tabs, and the fixed ratio means loading never shifts layout.
 */
export function VenueGuide({
  ref,
  tab: active,
  onTabChange,
}: {
  ref?: Ref<HTMLDivElement>;
  tab: GuideTabId;
  onTabChange: (tab: GuideTabId) => void;
}) {
  const { ends } = useCopy();
  const t = ends.guide;
  const base = useId();
  const idFor = (id: GuideTabId) => ({ tab: `${base}-${id}-tab`, panel: `${base}-${id}-panel` });

  const panels: Panel[] = [
    { id: "map", copy: t.map, frame: <EmbedFrame src={E.mapEmbedUrl} title={t.map.frameTitle} lazy /> },
    {
      id: "tour",
      copy: t.tour,
      frame: (
        <LazyEmbed src={E.virtualTourUrl} title={t.tour.frameTitle} loadLabel={t.tour.load} allow={TOUR_ALLOW} poster={<TourPoster />} />
      ),
      external: { href: E.virtualTourUrl, label: t.tour.open },
    },
  ];

  return (
    <div ref={ref} className="flex flex-col gap-4">
      <GuideTabs
        tabs={panels.map((p) => ({ id: p.id, label: p.copy.tab }))}
        active={active}
        label={t.tabsLabel}
        idFor={idFor}
        onSelect={onTabChange}
      />
      {panels.map((p) => (
        <div key={p.id} id={idFor(p.id).panel} role="tabpanel" aria-labelledby={idFor(p.id).tab} hidden={p.id !== active} className="flex flex-col gap-2.5">
          <div
            className="relative aspect-4/3 overflow-hidden rounded-[14px] border-[1.5px] border-ink bg-paper-2 min-[760px]:aspect-16/10"
            style={{ boxShadow: "var(--offset-md)" }}
          >
            {p.frame}
          </div>
          {p.external && (
            <a
              href={p.external.href}
              target="_blank"
              rel="noopener noreferrer"
              className="riso-focus self-end font-mono text-[11px] tracking-[0.18em] text-ink-2 uppercase underline underline-offset-4 hover:text-tomato"
            >
              {p.external.label} ↗
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
