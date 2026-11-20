"use client";

import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, type RefObject } from "react";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { usePerfTier } from "@/lib/hooks/use-perf-tier";
import { requestRefresh } from "../../shared/request-refresh";
import { queryMomentTrail } from "../elements";
import { createFinaleTimeline, restMemories } from "../finale/finale-timeline";
import { finaleProfile } from "../finale/profile";
import { layoutOutline } from "../finale/layout-outline";
import { placePile } from "../finale/place-pile";
import { handOverBadge } from "./badge-handover";
import { startBadgeSpin } from "./badge-spin";
import { activateCards, setCardsActivation } from "./card-activation";
import { cardFocusKeys } from "./card-focus";
import { ARRIVED_AT } from "./constants";
import { layoutTrail, type TrailMetrics } from "./layout-trail";
import { observeLayout } from "./observe-layout";
import { createTrailTimeline } from "./trail-timeline";

/**
 * Scroll-driven "How we met":
 * 1. The BK badge rides a winding path past each moment card, drawing it; it meets each card as
 *    that card reaches mid-screen, and cards wake as it passes.
 * 2. On reaching the personal note it hands over to a badge docked there, and the note pins while
 *    its outline draws and it grows.
 * The badge spins slowly at rest and faster with scroll speed.
 * On phones (`compact`) the cards are hidden, so the trail runs straight to the note, and the
 * finale uses the shorter phone profile whose memory photos open the moments.
 */
export function useMomentTrail(rootRef: RefObject<HTMLElement | null>, reduced: boolean, compact: boolean) {
  const tier = usePerfTier();
  // `compact`, `reduced` and `tier` read the server defaults until hydration, then switch together;
  // waiting builds the trail once, for the real device, instead of building and tearing down a wide one.
  const hydrated = useHydrated();
  useLayoutEffect(() => {
    const root = rootRef.current;
    const els = hydrated && root && queryMomentTrail(root);
    if (!root || !els) return;
    const { trail, finale } = els;
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, DrawSVGPlugin);

    let metrics: TrailMetrics = { docks: [], stops: [], total: 0 };
    const layout = () => {
      metrics = layoutTrail(trail, { dockCards: !compact });
      layoutOutline(finale);
      if (compact) placePile(finale);
    };
    layout();

    if (reduced) {
      handOverBadge(trail.rider, finale.dock, true);
      if (compact) {
        const rest = () => {
          placePile(finale);
          restMemories(finale, tier);
        };
        rest();
        window.addEventListener("resize", rest);
        return () => window.removeEventListener("resize", rest);
      }
      setCardsActivation(trail.cards, 1);
      return () => setCardsActivation(trail.cards, 0);
    }

    const keysFor = (trigger: ScrollTrigger) => {
      const rootTop = root.getBoundingClientRect().top + window.scrollY;
      return cardFocusKeys({
        dockTops: metrics.docks.map((dock) => rootTop + dock.y),
        stops: metrics.stops,
        total: metrics.total,
        vh: window.innerHeight,
        start: trigger.start,
        end: trigger.end,
      });
    };
    const ctx = gsap.context(() => {
      createTrailTimeline(trail, keysFor, (fraction) => {
        if (!compact) activateCards(trail.cards, metrics, fraction);
        handOverBadge(trail.rider, finale.dock, fraction >= ARRIVED_AT);
      });
      createFinaleTimeline({ ...finale, tier, profile: finaleProfile(compact) });
    }, root);
    // These triggers are created after those of later sections (this effect waits for hydration).
    // ScrollTrigger refreshes in creation order, so put the note pin back ahead of them, or they
    // would measure without its spacing and run a pin's length too early.
    ScrollTrigger.sort();
    requestRefresh();
    const stopSpin = startBadgeSpin(trail.spinners, root);
    const stopObserving = observeLayout(root);

    // Re-lay paths from fresh layout before ScrollTrigger re-measures (resize, fonts, images).
    ScrollTrigger.addEventListener("refreshInit", layout);
    return () => {
      ScrollTrigger.removeEventListener("refreshInit", layout);
      stopSpin();
      stopObserving();
      ctx.revert();
      if (!compact) setCardsActivation(trail.cards, 0);
    };
  }, [rootRef, reduced, compact, tier, hydrated]);
}
