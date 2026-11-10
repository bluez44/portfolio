/**
 * The trail drawn behind the moment cards: a faint dashed route and the solid line that draws in
 * behind the badge. No viewBox — user units are CSS px, so pin spacing changing the column's
 * height never rescales the path. Paths are filled in by `layout-trail`.
 */
export function TrailLine() {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
      <path data-trail-base fill="none" stroke="var(--ink)" strokeOpacity={0.28} strokeWidth={1.5} strokeDasharray="3 8" strokeLinecap="round" />
      <path data-trail-draw fill="none" stroke="var(--tomato)" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}
