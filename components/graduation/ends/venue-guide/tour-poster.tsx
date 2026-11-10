/** Riso placeholder shown before the tour loads (no photo yet). Purely decorative. */

const halftone = (color: string) => ({
  backgroundImage: `radial-gradient(color-mix(in oklab, var(--${color}) 45%, transparent) 1.2px, transparent 1.6px)`,
  backgroundSize: "12px 12px",
});

export function TourPoster() {
  return (
    <div className="grid h-full w-full place-items-center bg-paper-2" style={halftone("jade")}>
      <span
        className="-translate-y-14 font-heading text-[clamp(56px,9vw,104px)] leading-none font-bold tracking-[-0.04em] text-jade"
        style={{ fontVariationSettings: '"wdth" 80, "opsz" 96' }}
      >
        360°
      </span>
    </div>
  );
}
