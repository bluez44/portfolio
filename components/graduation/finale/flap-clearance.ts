/** Space (px) kept between the open flap's seal and the countdown, and between the envelope and the closing text. */
export const CLEARANCE_GAP = 12;

export type FlapLayout = {
  /** Bottom of the heading and countdown block. */
  headerBottom: number;
  wrapTop: number;
  wrapBottom: number;
  /** Top of the closing text and buttons. */
  footerTop: number;
  /** The flap stands this tall above the envelope while open, with the seal centred on its tip. */
  flapHeight: number;
  sealHeight: number;
};

/** Offset (px) and scale (about the envelope's centre) for the envelope while its flap is open. */
export type FlapFit = { y: number; scale: number };

/**
 * Fits the open envelope, from its seal to its bottom edge, between the countdown and the closing
 * text: lowered just enough for the seal to clear the countdown, and also shrunk when lowering alone
 * would push it into the text. Positions share one vertical axis.
 */
export function openFlapFit({ headerBottom, wrapTop, wrapBottom, footerTop, flapHeight, sealHeight }: FlapLayout): FlapFit {
  const sealTop = wrapTop - flapHeight - sealHeight / 2;
  const top = headerBottom + CLEARANCE_GAP;
  const bottom = footerTop - CLEARANCE_GAP;
  const scale = Math.min(1, Math.max(0, bottom - top) / (wrapBottom - sealTop));
  const centre = (wrapTop + wrapBottom) / 2;
  const scaledSealTop = centre - scale * (centre - sealTop);
  const y = Math.max(0, top - scaledSealTop);
  return { y, scale };
}
