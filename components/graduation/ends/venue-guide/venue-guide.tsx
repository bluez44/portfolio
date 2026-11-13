"use client";

import { useId, type ReactNode, type Ref } from "react";
import type { GuideTab } from "@/lib/graduation/i18n";
import { useCopy, useGradEvent } from "../../i18n/lang-context";
import { DeferredEmbed } from "./deferred-embed";
import { TourPoster } from "./tour-poster";
import { GuideTabs, type GuideTabId } from "./guide-tabs";
import { LazyEmbed } from "./lazy-embed";
import { ScrollShield } from "./scroll-shield";
import { SourceCredit } from "./source-credit";

/** Permissions the 3DVista tour uses for full screen and device-orientation look-around. */
const TOUR_ALLOW = "fullscreen; accelerometer; gyroscope; magnetometer; xr-spatial-tracking";

type Link = { href: string; label: string };
type Panel = { id: GuideTabId; copy: GuideTab; frame: ReactNode; external?: Link; credit?: Link & { owner: string } };

/**
 * Map and 360° campus tour in one fixed-ratio frame. The map loads by itself once nearby and the
 * visitor pauses scrolling; the tour waits for a click. Both panels stay mounted (inactive ones are hidden) so a
 * loaded embed survives switching tabs, and the fixed ratio means loading never shifts layout.
 */
export function VenueGuide({
  ref,
  tab: active,
  onTabChange,
  tourKey,
  onTourStart,
}: {
  ref?: Ref<HTMLDivElement>;
  tab: GuideTabId;
  onTabChange: (tab: GuideTabId) => void;
  tourKey?: number;
  /** the visitor clicked the tour's load button */
  onTourStart?: () => void;
}) {
  const { ends } = useCopy();
  const E = useGradEvent();
  const t = ends.guide;
  const base = useId();
  const idFor = (id: GuideTabId) => ({ tab: `${base}-${id}-tab`, panel: `${base}-${id}-panel` });

  const panels: Panel[] = [
    {
      id: "map",
      copy: t.map,
      frame: (
        <ScrollShield hint={t.map.hint} touchHint={t.map.touchHint}>
          <DeferredEmbed src={E.mapEmbedUrl} title={t.map.frameTitle} />
        </ScrollShield>
      ),
    },
    {
      id: "tour",
      copy: t.tour,
      frame: (
        <LazyEmbed key={tourKey} src={E.virtualTourUrl} title={t.tour.frameTitle} loadLabel={t.tour.load} allow={TOUR_ALLOW} poster={<TourPoster />} onLoadClick={onTourStart} />
      ),
      external: { href: E.virtualTourUrl, label: t.tour.open },
      credit: { href: E.virtualTourOwnerUrl, ...t.tour.credit },
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
          {(p.credit || p.external) && (
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
              {p.credit && <SourceCredit {...p.credit} />}
              {p.external && (
                <a
                  href={p.external.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="riso-focus ml-auto font-mono text-[11px] tracking-[0.18em] text-ink-2 uppercase underline underline-offset-4 hover:text-tomato"
                >
                  {p.external.label} ↗
                </a>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
