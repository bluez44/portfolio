/** A point on a photo, in percent of its width (`x`) and height (`y`), that stays in view when the photo is cropped. */
export type FocusPoint = { x: number; y: number };

/** The 3×3 grid of anchors the admin offered before free points; content saved back then still uses them. */
const FOCUS_PRESETS = {
  "top-left": { x: 0, y: 0 },
  top: { x: 50, y: 0 },
  "top-right": { x: 100, y: 0 },
  left: { x: 0, y: 50 },
  center: { x: 50, y: 50 },
  right: { x: 100, y: 50 },
  "bottom-left": { x: 0, y: 100 },
  bottom: { x: 50, y: 100 },
  "bottom-right": { x: 100, y: 100 },
} as const satisfies Record<string, FocusPoint>;

export type FocusPreset = keyof typeof FOCUS_PRESETS;
export const FOCUS_PRESET_NAMES = Object.keys(FOCUS_PRESETS) as [FocusPreset, ...FocusPreset[]];

/** Where a cropped photo is anchored: a free point, or one of the older grid presets. */
export type ImageFocus = FocusPoint | FocusPreset;

/** A photo's anchor on phones and on wide screens; either falls back to the centre. */
export type MomentFocus = { phone?: ImageFocus; wide?: ImageFocus };

export const CENTER: FocusPoint = FOCUS_PRESETS.center;

export const focusPoint = (focus: ImageFocus = CENTER): FocusPoint => (typeof focus === "string" ? FOCUS_PRESETS[focus] : focus);

/**
 * The CSS `object-position` for a focus. A percentage lines the photo's point up with the same
 * point of its frame, so the point is always inside the crop: dead centre at 50%, at the edge at 0 / 100%.
 */
export const focusPosition = (focus?: ImageFocus): string => {
  const { x, y } = focusPoint(focus);
  return `${x}% ${y}%`;
};
