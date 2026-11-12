import { BkBadge } from "./bk-badge";
import { FinaleParallaxPhotos } from "./finale-parallax-photos";
import { PersonalNoteCard } from "./personal-note-card";
import { PolaroidFrame } from "./polaroid-frame";

const outlineStroke = { fill: "none", stroke: "var(--tomato)", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/**
 * The trail's last stop. The outer wrapper stays in flow (the trail measures it); the inner element
 * is what gets pinned, holding the scalable note with its outline and the docked badge.
 */
export function NoteFinaleStage({ guestName, label, note, photos }: { guestName: string; label: string; note: string; photos: string[] }) {
  return (
    <div data-trail-end className="relative">
      <div data-trail-pin className="relative">
        <FinaleParallaxPhotos images={photos} />
        <div data-note-scale className="relative origin-top">
          <PolaroidFrame guestName={guestName}>
            <PersonalNoteCard label={label} note={note} />
          </PolaroidFrame>
          {/* After the card so it paints over the card's shadow. Offset by the outline gap (8px); sized and drawn by `layout-outline`. */}
          <svg data-note-outline aria-hidden className="pointer-events-none absolute -top-2 -left-2 overflow-visible">
            <path data-outline-half {...outlineStroke} />
            <path data-outline-half {...outlineStroke} />
          </svg>
        </div>
        <BkBadge docked />
      </div>
    </div>
  );
}
