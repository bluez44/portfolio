import { RisoButton } from "@/components/ui/riso/button";
import type { RsvpStatus } from "@/lib/graduation/types";
import { useCopy } from "../i18n/lang-context";

export function RsvpChoices({ choice, onChoose }: { choice: RsvpStatus | null; onChoose: (s: RsvpStatus) => void }) {
  const { rsvp: t } = useCopy();
  const dim = (status: RsvpStatus) => (choice && choice !== status ? "opacity-45" : "");
  return (
    <div className="flex flex-wrap gap-3.5">
      <RisoButton variant="primary" size="lg" icon="✓" aria-pressed={choice === "yes"} className={dim("yes")} onClick={() => onChoose("yes")}>
        {t.yes}
      </RisoButton>
      <RisoButton variant="ink" size="lg" icon="✗" aria-pressed={choice === "no"} className={dim("no")} onClick={() => onChoose("no")}>
        {t.no}
      </RisoButton>
    </div>
  );
}
