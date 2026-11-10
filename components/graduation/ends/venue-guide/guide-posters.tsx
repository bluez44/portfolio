/** Riso placeholders shown before an embed loads (no photos yet). Purely decorative. */

const halftone = (color: string) => ({
  backgroundImage: `radial-gradient(color-mix(in oklab, var(--${color}) 45%, transparent) 1.2px, transparent 1.6px)`,
  backgroundSize: "12px 12px",
});

export function MapPoster() {
  return (
    <div className="h-full w-full bg-paper-2" style={halftone("blue")}>
      <div
        className="h-full w-full"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in oklab, var(--ink) 14%, transparent) 1.5px, transparent 1.5px), linear-gradient(90deg, color-mix(in oklab, var(--ink) 14%, transparent) 1.5px, transparent 1.5px)",
          backgroundSize: "56px 56px",
        }}
      />
      <svg viewBox="0 0 24 32" className="absolute top-[22%] left-1/2 h-12 w-9 -translate-x-1/2 text-tomato">
        <path d="M12 31s10-11.3 10-19A10 10 0 0 0 2 12c0 7.7 10 19 10 19Z" fill="currentColor" stroke="var(--ink)" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="3.5" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

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
