import { RisoButton } from "@/components/ui/riso/button";
import { RisoPill } from "@/components/ui/riso/pill";
import type { RsvpStatus } from "@/lib/graduation/types";
import { useCopy } from "../i18n/lang-context";
import { AddToCalendar } from "../shared/add-to-calendar";

export function RsvpResult({ status, onReset }: { status: RsvpStatus; onReset: () => void }) {
  const { rsvp: t } = useCopy();
  return (
    <div className="flex flex-col items-start gap-4">
      <RisoPill color={status === "no" ? "tomato" : "jade"} tilt={-2} wrap>
        {t.result[status]}
      </RisoPill>
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {status === "yes" && <AddToCalendar />}
        <RisoButton
          variant="secondary"
          size="md"
          icon="↺"
          onClick={onReset}
        >
          {t.change}
        </RisoButton>
      </div>
    </div>
  );
}
