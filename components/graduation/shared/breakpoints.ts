/** Below this viewport width (px) the invitation uses its phone layout (Tailwind `max-[759px]:`). */
export const MOBILE_BREAKPOINT = 760;

/** Media query matching the phone layout. */
export const COMPACT_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;
