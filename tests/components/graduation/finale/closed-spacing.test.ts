import { describe, expect, it } from "vitest";
import { CLOSED_GAP, closedOffsets } from "@/components/graduation/finale/closed-spacing";

/** Measured at 390x780: the countdown ended 119px above the envelope, the closing text began 120px below it. */
const PHONE = { headerBottom: 162, wrapTop: 281, wrapBottom: 491, footerTop: 611 };

describe("closedOffsets", () => {
  it("brings the countdown down and the closing text up to CLOSED_GAP from the envelope", () => {
    const { header, footer } = closedOffsets(PHONE);
    expect(PHONE.headerBottom + header).toBe(PHONE.wrapTop - CLOSED_GAP);
    expect(PHONE.footerTop + footer).toBe(PHONE.wrapBottom + CLOSED_GAP);
  });

  it("never pushes either away when they already sit closer", () => {
    expect(closedOffsets({ ...PHONE, headerBottom: 270, footerTop: 500 })).toEqual({ header: 0, footer: 0 });
  });
});
