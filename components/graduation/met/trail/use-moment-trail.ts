"use client";

import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, type RefObject } from "react";
import { queryMomentTrail } from "../elements";
import { createFinaleTimeline } from "../finale/finale-timeline";
import { layoutOutline } from "../finale/layout-outline";
import { handOverBadge } from "./badge-handover";
import { startBadgeSpin } from "./badge-spin";
import { activateCards, setCardsActivation } from "./card-activation";
import { cardFocusKeys } from "./card-focus";
import { ARRIVED_AT } from "./constants";
import { layoutTrail, type TrailMetrics } from "./layout-trail";
import { createTrailTimeline } from "./trail-timeline";

/**
 * Scroll-driven "How we met":
 * 1. The BK badge rides a winding path past each moment card, drawing it; it meets each card as
 *    that card reaches mid-screen, and cards wake as it passes.
 * 2. On reaching the personal note it hands over to a badge docked there, and the note pins while
 *    its outline draws and it grows.
 * The badge spins slowly at rest and faster with scroll speed.
 */
export function useMomentTrail(rootRef: RefObject<HTMLElement | null>, reduced: boolean) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    const els = root && queryMomentTrail(root);
    if (!root || !els) return;
    const { trail, finale } = els;
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, DrawSVGPlugin);

    let metrics: TrailMetrics = { docks: [], stops: [], total: 0 };
    const layout = () => {
      metrics = layoutTrail(trail);
      layoutOutline(finale);
    };
    layout();

    if (reduced) {
      handOverBadge(trail.rider, finale.dock, true);
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
        activateCards(trail.cards, metrics, fraction);
        handOverBadge(trail.rider, finale.dock, fraction >= ARRIVED_AT);
      });
      createFinaleTimeline(finale);
    }, root);
    const stopSpin = startBadgeSpin(trail.spinners);

    // Re-lay paths from fresh layout before ScrollTrigger re-measures (resize, fonts, images).
    ScrollTrigger.addEventListener("refreshInit", layout);
    return () => {
      ScrollTrigger.removeEventListener("refreshInit", layout);
      stopSpin();
      ctx.revert();
      setCardsActivation(trail.cards, 0);
    };
  }, [rootRef, reduced]);
}
