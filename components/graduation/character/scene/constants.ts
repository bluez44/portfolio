import type { PoseState } from "./pose";

export const FOV = 28;
export const CAMERA_Y = 1.2;
export const CAMERA_Z = 14;
export const MAX_PIXEL_RATIO = 2;

/** Below this viewport width (px) the character is drawn smaller. */
export const MOBILE_BREAKPOINT = 760;
export const MOBILE_SCALE = 0.55;

/** Pose before the first beat applies: waving on the right. */
export const INITIAL_POSE: PoseState = { x: 0.68, ry: -0.5, wave: 1, bow: 0, sit: 0, point: 0, toss: 0, cheer: 0, play: 0, walk: 0, dir: 0 };
