import { describe, expect, it } from "vitest";
import { CLEARANCE_GAP, openFlapFit, type FlapLayout } from "@/components/graduation/finale/flap-clearance";

/** Measured at 390x780: the open seal overlapped the countdown by 29px, with room below. */
const PHONE: FlapLayout = { headerBottom: 162, wrapTop: 281, wrapBottom: 491, footerTop: 611, flapHeight: 113, sealHeight: 74 };
/** A short desktop window: lowering alone cannot clear the countdown. */
const SHORT_DESKTOP: FlapLayout = { headerBottom: 200, wrapTop: 236, wrapBottom: 523, footerTop: 599, flapHeight: 155, sealHeight: 74 };

/** The open envelope's seal top and bottom edge after the fit. */
function fitted(layout: FlapLayout) {
  const { y, scale } = openFlapFit(layout);
  const centre = (layout.wrapTop + layout.wrapBottom) / 2;
  const sealTop = layout.wrapTop - layout.flapHeight - layout.sealHeight / 2;
  return { y, scale, top: centre + y - scale * (centre - sealTop), bottom: centre + y + scale * (layout.wrapBottom - centre) };
}

describe("openFlapFit", () => {
  it("only lowers the envelope when there is room", () => {
    const f = fitted(PHONE);
    expect(f.scale).toBe(1);
    expect(f.top).toBeCloseTo(PHONE.headerBottom + CLEARANCE_GAP);
    expect(f.bottom).toBeLessThanOrEqual(PHONE.footerTop - CLEARANCE_GAP);
  });

  it("also shrinks it when lowering alone would reach the closing text", () => {
    const f = fitted(SHORT_DESKTOP);
    expect(f.scale).toBeLessThan(1);
    expect(f.top).toBeCloseTo(SHORT_DESKTOP.headerBottom + CLEARANCE_GAP);
    expect(f.bottom).toBeCloseTo(SHORT_DESKTOP.footerTop - CLEARANCE_GAP);
  });

  it("leaves the envelope alone when the seal already clears", () => {
    expect(openFlapFit({ ...PHONE, headerBottom: 80 })).toEqual({ y: 0, scale: 1 });
  });
});
