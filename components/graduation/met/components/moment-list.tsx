import type { Moment } from "@/lib/graduation/i18n";
import { MomentCard } from "./moment-card";

/**
 * Wide screens: a column of cards alternating left and right along the trail. Phones meet the
 * moments in the note finale instead, so the column is hidden there.
 */
export function MomentList({ moments, onOpen }: { moments: Moment[]; onOpen: (index: number) => void }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-32 p-0 max-[759px]:hidden">
      {moments.map((m, i) => (
        <MomentCard key={m.n} moment={m} side={i % 2 === 0 ? "left" : "right"} onOpen={() => onOpen(i)} />
      ))}
    </ol>
  );
}
