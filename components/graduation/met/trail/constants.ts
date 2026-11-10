/** Where the trail starts: this share of the column width, at the column's top edge. */
export const START_X = 0.9;
/** ScrollTrigger line where the badge sets off. */
export const START_LINE = "top 70%";
/** Gap (px) between a card's edge and the point where the trail docks beside it. */
export const DOCK_GAP = 26;
/** Path length (px) over which a card wakes up before and fades after the badge passes. */
export const REACH = 170;
/** z-index for a card the badge is near, so it lifts above its neighbours. */
export const ACTIVE_Z = "10";
/** Trail progress treated as "arrived" (handover to the docked badge). */
export const ARRIVED_AT = 0.999;

/** Badge spin (deg/s): a slow idle turn, plus a boost from scroll velocity (px/s) in its direction. */
export const SPIN_IDLE = 24;
export const SPIN_PER_PX = 0.4;
export const SPIN_MAX = 720;
/** How quickly (1/s) the spin speed eases toward its target. */
export const SPIN_RESPONSE = 5;
/** Longest frame (ms) integrated, so a backgrounded tab does not spin wildly on return. */
export const MAX_FRAME_MS = 100;
