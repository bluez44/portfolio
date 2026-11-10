/**
 * Riso "BK" roundel. Stand-in until a real HCMUT logo is added.
 * - rider: travels the trail (MotionPath owns its transform).
 * - docked: sits on the pinned note card's top edge once the rider arrives, so it stays with the card.
 * Only the inner `[data-badge-spin]` disc rotates, leaving the outer transform free for the path.
 */
export function BkBadge({ docked = false }: { docked?: boolean }) {
  return (
    <div
      {...(docked ? { "data-trail-dock": "" } : { "data-trail-badge": "" })}
      aria-hidden
      className={`pointer-events-none absolute top-0 z-20 grid h-12 w-12 place-items-center rounded-full border-[1.5px] border-ink bg-blue ${docked ? "invisible left-1/2 -mt-6 -ml-6" : "left-0"}`}
      style={{ boxShadow: "var(--offset-sm)" }}
    >
      <div data-badge-spin className="grid h-[38px] w-[38px] place-items-center rounded-full border-[1.5px] border-dashed border-paper">
        <span className="font-heading text-[15px] leading-none font-bold tracking-[-0.02em] text-paper">BK</span>
      </div>
    </div>
  );
}
