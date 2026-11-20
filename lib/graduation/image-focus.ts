/** Where a cropped photo is anchored, on a 3×3 grid, and the CSS `object-position` for each. */
const FOCUS_POSITIONS = {
  "top-left": "0% 0%",
  top: "50% 0%",
  "top-right": "100% 0%",
  left: "0% 50%",
  center: "50% 50%",
  right: "100% 50%",
  "bottom-left": "0% 100%",
  bottom: "50% 100%",
  "bottom-right": "100% 100%",
} as const;

export type ImageFocus = keyof typeof FOCUS_POSITIONS;
export const IMAGE_FOCI = Object.keys(FOCUS_POSITIONS) as [ImageFocus, ...ImageFocus[]];

/** A moment photo's anchor on phones and on wide screens; either falls back to the centre. */
export type MomentFocus = { phone?: ImageFocus; wide?: ImageFocus };

export const focusPosition = (focus: ImageFocus = "center"): string => FOCUS_POSITIONS[focus];
