/** Formats a coordinate for SVG path data (one decimal keeps paths short and stable). */
export const svgNum = (n: number): string => n.toFixed(1);
