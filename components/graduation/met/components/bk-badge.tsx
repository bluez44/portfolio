import Image from "next/image";

/**
 * Riso "BK" roundel. Stand-in until a real HCMUT logo is added.
 * - rider: travels the trail (MotionPath owns its transform); hidden until placed on the path.
 * - docked: sits on the pinned note card's top edge once the rider arrives, so it stays with the card.
 * Only the inner `[data-badge-spin]` disc rotates, leaving the outer transform free for the path.
 */
export function BkBadge({ docked = false }: { docked?: boolean }) {
  return (
    <div
      {...(docked ? { "data-trail-dock": "" } : { "data-trail-badge": "" })}
      aria-hidden
      className={`pointer-events-none absolute top-0 z-20 grid h-20 w-20 place-items-center rounded-full border-[1.5px] border-ink bg-blue invisible ${docked ? "left-1/2 -mt-6 -ml-6" : "left-0"}`}
      style={{ boxShadow: "var(--offset-sm)" }}
    >
      <div
        data-badge-spin
        className="grid h-12 w-12 place-items-center rounded-full"
      >
        <Image
          src="/01_logobachkhoatoi.webp"
          alt=""
          width={1822}
          height={1822}
          className="-translate-y-1 aspect-square"
        />
      </div>
    </div>
  );
}
